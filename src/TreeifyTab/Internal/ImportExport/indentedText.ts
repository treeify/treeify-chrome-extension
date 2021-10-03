import {List} from 'immutable'
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

  for (const indentUnit of List.of(' ', '  ', '   ', '    ', '　', '　　', '\t')) {
    // TODO: 最適化の余地あり。パースの試行とパース成功確認後の項目生成の2回に分けてトラバースしている
    if (canParseAsIndentedText(lines, indentUnit)) {
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

// 指定されたインデント単位のインデント形式テキストかどうか判定する。
// インデントがおかしい場合や一箇所もインデントが見つからない場合はfalseを返す。
function canParseAsIndentedText(lines: string[], indentUnit: string): boolean {
  const results = lines.map((line) => analyzeIndentation(line, indentUnit))

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    const prevLineResult = results[i - 1]

    // インデントが省略された空行の場合、前の行のインデントレベルを継承する
    if (result.indentLevel === 0 && result.text === '' && prevLineResult !== undefined) {
      result.indentLevel = prevLineResult.indentLevel
    }

    if (prevLineResult !== undefined && result.indentLevel > prevLineResult.indentLevel + 1) {
      // インデントレベルが飛び級になっている場合
      return false
    }
  }

  const indentLevels = List(results).map((result) => result.indentLevel)
  return (indentLevels.max() ?? 0) > 0
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

function getIndentLevel(line: string, indentUnit: string): integer {
  if (line.startsWith(indentUnit)) {
    return 1 + getIndentLevel(line.substring(indentUnit.length), indentUnit)
  } else {
    return 0
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
  const itemIds: ItemId[] = []

  const baseIndentLevel = getIndentLevel(lines[0], indentUnit)
  const rootItemId = createItemFromSingleLineText(lines[0])
  itemIds.push(rootItemId)
  const rootItemIds = [rootItemId]

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const indentLevel = getIndentLevel(line, indentUnit) - baseIndentLevel
    if (indentLevel === itemIds.length) {
      // 前の行よりインデントが1つ深い場合
      const newItemId = createItemFromSingleLineText(line)
      CurrentState.insertLastChildItem(itemIds[itemIds.length - 1], newItemId)
      itemIds.push(newItemId)
    } else {
      // 前の行とインデントの深さが同じか、それより浅い場合
      itemIds.length = indentLevel + 1

      const newItemId = createItemFromSingleLineText(line)

      if (itemIds.length === 1) {
        // 親の居ない項目
        itemIds[indentLevel] = newItemId
        rootItemIds.push(newItemId)
      } else {
        CurrentState.insertLastChildItem(itemIds[itemIds.length - 2], newItemId)
        itemIds[indentLevel] = newItemId
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
