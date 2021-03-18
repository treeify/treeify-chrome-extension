import {integer, ItemId, ItemType} from 'src/Common/basicType'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {DomishObject} from 'src/Common/DomishObject'
import {assertNeverType} from 'src/Common/Debug/assert'
import {List} from 'immutable'

/** 指定されたアイテムを頂点とするインデント形式のプレーンテキストを作る */
export function exportAsIndentedText(itemId: ItemId): string {
  return exportAsIndentedLines(itemId).join('\n')
}

function exportAsIndentedLines(itemId: ItemId, indentLevel = 0): List<string> {
  const line = '  '.repeat(indentLevel) + getContentAsPlainText(itemId)
  if (NextState.isPage(itemId)) {
    return List.of(line)
  }
  const childLines = NextState.getChildItemIds(itemId).flatMap((childItemId) => {
    return exportAsIndentedLines(childItemId, indentLevel + 1)
  })
  return childLines.unshift(line)
}

// アイテムタイプごとのフォーマットでコンテンツをプレーンテキスト化する
function getContentAsPlainText(itemId: ItemId): string {
  const itemType = NextState.getItemType(itemId)
  switch (itemType) {
    case ItemType.TEXT:
      return DomishObject.toSingleLinePlainText(NextState.getTextItemDomishObjects(itemId))
    case ItemType.WEB_PAGE:
      const title =
        NextState.getWebPageItemTitle(itemId) ?? NextState.getWebPageItemTabTitle(itemId)
      const url = NextState.getWebPageItemUrl(itemId)
      return `${title} ${url}`
    default:
      assertNeverType(itemType)
  }
}

/** 複数行のテキストをできるだけ良い形でTreeifyに取り込む */
export function pasteMultilineText(text: string) {
  const lines = text.split('\n')

  for (const indentUnit of List.of(' ', '  ', '   ', '    ', '　', '\t')) {
    // TODO: 最適化の余地あり。パースの試行とパース成功確認後のアイテム生成の2回に分けてトラバースしている
    if (canParseAsIndentedText(lines, indentUnit)) {
      // インデント形式のテキストとして認識できた場合
      const rootItemIds = createItemsFromIndentedText(lines, indentUnit)
      for (const rootItemId of rootItemIds.reverse()) {
        NextState.insertNextSiblingItem(NextState.getTargetItemPath(), rootItemId)
      }
      NextState.commit()
      return
    }
  }

  // 特に形式を認識できなかった場合、フラットな1行テキストの並びとして扱う
  for (const itemId of lines.map(createItemFromSingleLineText).reverse()) {
    NextState.insertNextSiblingItem(NextState.getTargetItemPath(), itemId)
  }
  NextState.commit()
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
      NextState.insertLastChildItem(itemIds[itemIds.length - 1], newItemId)
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
        NextState.insertLastChildItem(itemIds[itemIds.length - 2], newItemId)
        itemIds[indentLevel] = newItemId
      }
    }
  }
  return List(rootItemIds)
}

// TODO: URLが画像かどうか判定するためにasyncにしなければならないかも
function createItemFromSingleLineText(line: string): ItemId {
  // TODO: URLが含まれている場合は非テキストアイテムを作る

  const itemId = NextState.createTextItem()
  NextState.setTextItemDomishObjects(
    itemId,
    List.of({
      type: 'text',
      textContent: line,
    })
  )
  return itemId
}
