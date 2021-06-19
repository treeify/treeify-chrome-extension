import {List} from 'immutable'
import {assertNeverType} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

/** 指定されたアイテムを頂点とするインデント形式のプレーンテキストを作る */
export function exportAsIndentedText(itemPath: ItemPath): string {
  return exportAsIndentedLines(itemPath).join('\n')
}

function exportAsIndentedLines(itemPath: ItemPath, indentLevel = 0): List<string> {
  const line = '  '.repeat(indentLevel) + getContentAsPlainText(ItemPath.getItemId(itemPath))

  const childLines = CurrentState.getDisplayingChildItemIds(itemPath).flatMap((childItemId) => {
    return exportAsIndentedLines(itemPath.push(childItemId), indentLevel + 1)
  })
  return childLines.unshift(line)
}

/** アイテムタイプごとのフォーマットでコンテンツをプレーンテキスト化する */
export function getContentAsPlainText(itemId: ItemId): string {
  const itemType = Internal.instance.state.items[itemId].itemType
  switch (itemType) {
    case ItemType.TEXT:
      const domishObjects = Internal.instance.state.textItems[itemId].domishObjects
      return DomishObject.toSingleLinePlainText(domishObjects)
    case ItemType.WEB_PAGE:
      const webPageItem = Internal.instance.state.webPageItems[itemId]
      const title = CurrentState.deriveWebPageItemTitle(itemId)
      return `${title} ${webPageItem.url}`
    case ItemType.IMAGE:
      const imageItem = Internal.instance.state.imageItems[itemId]
      return `${imageItem.caption} ${imageItem.url}`
    case ItemType.CODE_BLOCK:
      const codeBlockItem = Internal.instance.state.codeBlockItems[itemId]
      // 一行目くらいしかまともに表示できるものは見当たらない
      return codeBlockItem.code.split(/\r?\n/)[0]
    default:
      assertNeverType(itemType)
  }
}

/** 複数行のテキストをできるだけ良い形でTreeifyに取り込む */
export function pasteMultilineText(text: string) {
  const lines = text.split(/\r?\n/)

  for (const indentUnit of List.of(' ', '  ', '   ', '    ', '　', '\t')) {
    // TODO: 最適化の余地あり。パースの試行とパース成功確認後のアイテム生成の2回に分けてトラバースしている
    if (canParseAsIndentedText(lines, indentUnit)) {
      // インデント形式のテキストとして認識できた場合
      const rootItemIds = createItemsFromIndentedText(lines, indentUnit)
      for (const rootItemId of rootItemIds.reverse()) {
        CurrentState.insertBelowItem(CurrentState.getTargetItemPath(), rootItemId)
      }
      Rerenderer.instance.rerender()
      return
    }
  }

  // 特に形式を認識できなかった場合、フラットな1行テキストの並びとして扱う
  for (const itemId of lines.map(createItemFromSingleLineText).reverse()) {
    CurrentState.insertBelowItem(CurrentState.getTargetItemPath(), itemId)
  }
  Rerenderer.instance.rerender()
}

// 指定されたインデント単位のインデント形式テキストかどうか判定する。
// インデントがおかしい場合や一箇所もインデントが見つからない場合はfalseを返す。
function canParseAsIndentedText(lines: string[], indentUnit: string): boolean {
  let prevIndentLevel: integer | undefined
  let hasAtLeastOneIndent = false
  for (const line of lines) {
    const indentLevel = getIndentLevel(line, indentUnit)
    if (prevIndentLevel !== undefined && indentLevel > prevIndentLevel + 1) {
      // パース失敗
      return false
    }
    prevIndentLevel = indentLevel
    // indentLevelが一度でも1以上になればhasAtLeastOneIndentはtrueになる
    hasAtLeastOneIndent ||= indentLevel > 0
  }
  return hasAtLeastOneIndent
}

function getIndentLevel(line: string, indentUnit: string): integer {
  if (line.startsWith(indentUnit)) {
    return 1 + getIndentLevel(line.substring(indentUnit.length), indentUnit)
  } else {
    return 0
  }
}

/*
インデント形式のテキストから、新規アイテムのツリーを作成する。
【動作イメージ】
1
  3
  4
    8
9
↓
[1]
[1, 3]（自身の深さより1つ浅い1番アイテムの子リスト末尾に追加する）
[1, 4]（深さ2のアイテムを4に上書き）
[1, 4, 8]
[9]（自身より深いアイテムは全部削除する）
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
        // 親の居ないアイテム
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
  // テキストアイテムを作る
  const itemId = CurrentState.createTextItem()
  CurrentState.setTextItemDomishObjects(
    itemId,
    List.of({
      type: 'text',
      textContent: line,
    })
  )
  return itemId
}
