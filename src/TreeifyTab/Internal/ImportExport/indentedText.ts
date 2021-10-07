import {List} from 'immutable'
import {MultiSet} from 'mnemonist'
import {assertNeverType, assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyTab/Internal/DomishObject'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {ExportFormat} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

/**
 * 与えられた複数行のテキストから無駄なインデントを除去する。
 * インデント文字として認識するのは半角スペース、全角スペース、タブ文字のみ。
 */
export function removeRedundantIndent(indentedText: string): string {
  const lines = List(indentedText.split(/\r?\n/))

  const spaceCounts = lines.map((line) => {
    return line.search(/[^ ]/)
  })
  const tabCounts = lines.map((line) => {
    return line.search(/[^\t]/)
  })
  const fullWidthSpaceCounts = lines.map((line) => {
    return line.search(/[^　]/)
  })

  const minSpaceCount = spaceCounts.filter((count) => count >= 0).min() ?? 0
  const minTabCount = tabCounts.filter((count) => count >= 0).min() ?? 0
  const minFullWidthSpaceCount = fullWidthSpaceCounts.filter((count) => count >= 0).min() ?? 0
  const maxCount = Math.max(minSpaceCount, minTabCount, minFullWidthSpaceCount)
  return lines.map((line) => line.substr(maxCount)).join('\n')
}

/** 指定された項目を頂点とするインデント形式のプレーンテキストを作る */
export function exportAsIndentedText(itemPath: ItemPath): string {
  const exportSettings = Internal.instance.state.exportSettings
  const indentUnit = exportSettings.options[ExportFormat.PLAIN_TEXT].indentationExpression
  return List(yieldIndentedLines(itemPath, indentUnit)).join('\n')
}

function* yieldIndentedLines(
  itemPath: ItemPath,
  indentUnit: string,
  depth: integer = 0
): Generator<string> {
  const indent = indentUnit.repeat(depth)
  for (const contentLine of extractPlainText(itemPath).split(/\r?\n/)) {
    yield indent + contentLine
  }

  const state = Internal.instance.state
  const childItemIds = state.exportSettings.options[ExportFormat.PLAIN_TEXT].ignoreInvisibleItems
    ? CurrentState.getDisplayingChildItemIds(itemPath)
    : state.items[ItemPath.getItemId(itemPath)].childItemIds
  for (const childItemId of childItemIds) {
    const childItemPath = itemPath.push(childItemId)
    yield* yieldIndentedLines(childItemPath, indentUnit, depth + 1)
  }
}

/** 指定された項目単体のプレーンテキスト表現を生成する */
export function extractPlainText(itemPath: ItemPath): string {
  const itemId = ItemPath.getItemId(itemPath)
  const itemType = Internal.instance.state.items[itemId].type
  switch (itemType) {
    case ItemType.TEXT:
      const domishObjects = Internal.instance.state.textItems[itemId].domishObjects
      return DomishObject.toPlainText(domishObjects)
    case ItemType.WEB_PAGE:
      const webPageItem = Internal.instance.state.webPageItems[itemId]
      const title = CurrentState.deriveWebPageItemTitle(itemId)
      return `${title} ${webPageItem.url}`
    case ItemType.IMAGE:
      const imageItem = Internal.instance.state.imageItems[itemId]
      if (imageItem.caption !== '') {
        return `${imageItem.caption} ${imageItem.url}`
      } else {
        return imageItem.url
      }
    case ItemType.CODE_BLOCK:
      return Internal.instance.state.codeBlockItems[itemId].code
    case ItemType.TEX:
      return Internal.instance.state.texItems[itemId].code
    default:
      assertNeverType(itemType)
  }
}

/** 複数行のテキストをできるだけ良い形でTreeifyに取り込む */
export function pasteMultilineText(text: string) {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const lines = removeRedundantIndent(text).split(/\r?\n/)

  const indentUnit = detectIndent(lines)
  if (indentUnit !== '') {
    // TODO: 最適化の余地あり。パースの試行とパース成功確認後の項目生成の2回に分けてトラバースしている
    // インデント形式のテキストとして認識できた場合
    const rootItemIds = createItemsFromIndentedText(lines, indentUnit)
    for (const rootItemId of rootItemIds.reverse()) {
      CurrentState.insertBelowItem(targetItemPath, rootItemId)
    }

    // ターゲットを更新する
    const belowItemPath = CurrentState.findBelowItemPath(targetItemPath)
    assertNonUndefined(belowItemPath)
    CurrentState.setTargetItemPath(belowItemPath)

    // 空のテキスト項目上で実行した場合は空のテキスト項目を削除する
    if (CurrentState.isEmptyTextItem(targetItemId)) {
      CurrentState.deleteItem(targetItemId)
    }

    Rerenderer.instance.rerender()
    return
  }

  // 特に形式を認識できなかった場合、フラットな1行テキストの並びとして扱う
  for (const itemId of lines.map(createItemFromSingleLineText).reverse()) {
    CurrentState.insertBelowItem(targetItemPath, itemId)
  }

  // ターゲットを更新する
  const belowItemPath = CurrentState.findBelowItemPath(targetItemPath)
  assertNonUndefined(belowItemPath)
  CurrentState.setTargetItemPath(belowItemPath)

  // 空のテキスト項目上で実行した場合は空のテキスト項目を削除する
  if (CurrentState.isEmptyTextItem(targetItemId)) {
    CurrentState.deleteItem(targetItemId)
  }

  Rerenderer.instance.rerender()
}

// インデントを解析し、インデントの単位となる文字列を返す。
// 例えばいわゆる2スペースインデントの場合は'  'を返す。
// インデントが見つからなかった場合空文字列を返す。
function detectIndent(lines: string[]): string {
  const result = List.of(' ', '\t', '　')
    .map((indentChar) => {
      const {size, likelihood} = detectIndentSize(lines, indentChar)
      return {indentChar, size, likelihood}
    })
    .maxBy((value) => value.likelihood)
  assertNonUndefined(result)

  return result.indentChar.repeat(result.size)
}

// 最も尤もらしいインデントサイズを解析する。
// 指定された文字でのインデントが全く見つからない場合は{size: 0, likelihood: 0}を返す。
function detectIndentSize(
  lines: string[],
  indentChar: string
): {size: integer; likelihood: integer} {
  // インデント文字の左端出現数を行ごとに数える。
  // ただし空行はスキップする。
  const indentCharCounts = lines
    .filter((line) => line !== '')
    .map((line) => line.search(new RegExp(`[^${indentChar}]`)))

  // 前の行からのインデントサイズの増分を計算・収集する
  const positiveGaps = new MultiSet<integer>()
  for (let i = 1; i < indentCharCounts.length; i++) {
    const gap = indentCharCounts[i] - indentCharCounts[i - 1]
    if (gap > 0) {
      positiveGaps.add(gap)
    }
  }

  const result = positiveGaps.top(1)[0]
  if (result !== undefined) {
    return {size: result[0], likelihood: result[1]}
  } else {
    return {size: 0, likelihood: 0}
  }
}

// インデント付きの行を「インデントレベル」と「インデントを除いたテキスト部」に分割する
function analyzeIndentation(
  line: string,
  indentUnit: string
): {indentLevel: integer; text: string} {
  if (line.startsWith(indentUnit)) {
    const indentation = analyzeIndentation(line.substring(indentUnit.length), indentUnit)
    return {
      indentLevel: indentation.indentLevel + 1,
      text: indentation.text,
    }
  } else {
    return {
      indentLevel: 0,
      text: line,
    }
  }
}

/*
インデント形式のテキストから、新規項目のツリーを作成する。
【動作イメージ】
1
  3
  4
    8
9
↓
[1]
[1, 3]（自身の深さより1つ浅い1番項目の子リスト末尾に追加する）
[1, 4]（深さ2の項目を4に上書き）
[1, 4, 8]
[9]（自身より深い項目は全部削除する）
 */
function createItemsFromIndentedText(lines: string[], indentUnit: string): List<ItemId> {
  const analyzedLines = lines.map((line) => analyzeIndentation(line, indentUnit))

  const rootItemId = createItemFromSingleLineText(analyzedLines[0].text)
  const itemIds: ItemId[] = []
  itemIds.push(rootItemId)
  const rootItemIds = [rootItemId]

  for (let i = 1; i < analyzedLines.length; i++) {
    const analyzedLine = analyzedLines[i]

    // インデントが省略された空行の場合、前の行のインデントレベルを継承する
    if (analyzedLine.indentLevel === 0 && analyzedLine.text === '') {
      analyzedLine.indentLevel = analyzedLines[i - 1].indentLevel
    }

    if (analyzedLine.indentLevel === itemIds.length) {
      // 前の行よりインデントが1つ深い場合
      const newItemId = createItemFromSingleLineText(analyzedLine.text)
      CurrentState.insertLastChildItem(itemIds[itemIds.length - 1], newItemId)
      itemIds.push(newItemId)
    } else {
      // 前の行とインデントの深さが同じか、それより浅い場合
      itemIds.length = analyzedLine.indentLevel + 1

      const newItemId = createItemFromSingleLineText(analyzedLine.text)

      if (itemIds.length === 1) {
        // 親の居ない項目
        itemIds[analyzedLine.indentLevel] = newItemId
        rootItemIds.push(newItemId)
      } else {
        CurrentState.insertLastChildItem(itemIds[itemIds.length - 2], newItemId)
        itemIds[analyzedLine.indentLevel] = newItemId
      }
    }
  }

  return List(rootItemIds)
}

function createItemFromSingleLineText(line: string): ItemId {
  // テキスト項目を作る
  const itemId = CurrentState.createTextItem()
  CurrentState.setTextItemDomishObjects(itemId, DomishObject.fromPlainText(line))
  return itemId
}
