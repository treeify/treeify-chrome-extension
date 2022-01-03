import { List } from 'immutable'
import { MultiSet } from 'mnemonist'
import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { ExportFormat } from 'src/TreeifyTab/Internal/State'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { assertNeverType, assertNonUndefined } from 'src/Utility/Debug/assert'
import { integer } from 'src/Utility/integer'
import { MutableOrderedTree } from 'src/Utility/OrderedTree'

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
  const itemId = ItemPath.getItemId(itemPath)
  for (const contentLine of extractPlainText(itemId).split(/\r?\n/)) {
    yield indent + contentLine
  }

  const state = Internal.instance.state
  const childItemIds = state.exportSettings.options[ExportFormat.PLAIN_TEXT].includeInvisibleItems
    ? state.items[itemId].childItemIds
    : CurrentState.getDisplayingChildItemIds(itemPath)
  for (const childItemId of childItemIds) {
    const childItemPath = itemPath.push(childItemId)
    yield* yieldIndentedLines(childItemPath, indentUnit, depth + 1)
  }
}

/** 指定された項目単体のプレーンテキスト表現を生成する */
export function extractPlainText(itemId: ItemId): string {
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
      const codeBlockItem = Internal.instance.state.codeBlockItems[itemId]
      if (codeBlockItem.caption !== '') {
        return `${codeBlockItem.code}\n${codeBlockItem.caption}`
      }
      return codeBlockItem.code
    case ItemType.TEX:
      const texItem = Internal.instance.state.texItems[itemId]
      if (texItem.caption !== '') {
        return `${texItem.code}\n${texItem.caption}`
      }
      return texItem.code
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
    const trees = parseIndentedText(lines, indentUnit)
    // ※インデントされていない行が8割ある場合はインデント形式として認識しない
    if (trees !== undefined && trees.size / lines.length < 0.8) {
      // インデント形式のテキストとして認識できた場合

      const rootItemIds = trees.map((tree) =>
        tree.fold((value, children: ItemId[]) => {
          const itemId = createItemFromSingleLineText(value)
          for (const childItemId of children) {
            CurrentState.insertLastChildItem(itemId, childItemId)
          }
          return itemId
        })
      )
      for (const rootItemId of rootItemIds.reverse()) {
        CurrentState.insertBelowItem(targetItemPath, rootItemId)
      }

      // ターゲットを更新する
      const belowItemPath = CurrentState.findBelowItemPath(targetItemPath)
      assertNonUndefined(belowItemPath)
      CurrentState.setTargetItemPath(belowItemPath)
      Rerenderer.instance.requestToFocusTargetItem()

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
  Rerenderer.instance.requestToFocusTargetItem()

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
      const { size, likelihood } = detectIndentSize(lines, indentChar)
      return { indentChar, size, likelihood }
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
): { size: integer; likelihood: integer } {
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
    return { size: result[0], likelihood: result[1] }
  } else {
    return { size: 0, likelihood: 0 }
  }
}

// インデント付きの行を「インデントレベル」と「インデントを除いたテキスト部」に分割する
function analyzeIndentation(
  line: string,
  indentUnit: string
): { indentLevel: integer; text: string } {
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
インデント形式のテキストからツリー構造に変換する。
スタックを使って親候補を保持し、自身のインデントレベルに応じて特定できる親の子リストに自身を追加する。
【スタックの動作イメージ】
1
  2
  3
    4
5
↓
[1]
[1, 2]
[1, 3]
[1, 3, 4]
[5]
*/
function parseIndentedText(
  lines: string[],
  indentUnit: string
): List<MutableOrderedTree<string>> | undefined {
  if (lines.length === 0) return undefined

  const analyzedLines = lines.map((line) => analyzeIndentation(line, indentUnit))

  if (analyzedLines[0].indentLevel > 0) return undefined

  const firstRootNode = new MutableOrderedTree(analyzedLines[0].text)
  const stack: MutableOrderedTree<string>[] = []
  stack.push(firstRootNode)
  const rootNodes = [firstRootNode]

  for (let i = 1; i < analyzedLines.length; i++) {
    const analyzedLine = analyzedLines[i]

    // インデントが省略された空行の場合、前の行のインデントレベルを継承する
    if (analyzedLine.indentLevel === 0 && analyzedLine.text === '') {
      analyzedLine.indentLevel = analyzedLines[i - 1].indentLevel
    }

    // インデントレベルが飛び級になっている場合、ツリー化を諦める
    if (analyzedLine.indentLevel > stack.length) return undefined

    if (analyzedLine.indentLevel === stack.length) {
      // 前の行よりインデントが1つ深い場合
      const newNode = new MutableOrderedTree(analyzedLine.text)
      stack[stack.length - 1].children.push(newNode)
      stack.push(newNode)
    } else {
      // 前の行とインデントの深さが同じか、それより浅い場合

      stack.length = analyzedLine.indentLevel + 1

      const newNode = new MutableOrderedTree(analyzedLine.text)
      stack[stack.length - 1] = newNode

      if (stack.length === 1) {
        // 親の居ない項目
        rootNodes.push(newNode)
      } else {
        stack[stack.length - 2].children.push(newNode)
      }
    }
  }

  return List(rootNodes)
}

function createItemFromSingleLineText(line: string): ItemId {
  // テキスト項目を作る
  const itemId = CurrentState.createTextItem()
  CurrentState.setTextItemDomishObjects(itemId, DomishObject.fromPlainText(line))
  return itemId
}
