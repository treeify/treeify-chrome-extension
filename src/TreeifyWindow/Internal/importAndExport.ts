import {ItemId, ItemType} from 'src/Common/basicType'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {DomishObject} from 'src/Common/DomishObject'
import {assertNeverType} from 'src/Common/Debug/assert'

/** 指定されたアイテムを頂点とするインデント形式のプレーンテキストを作る */
export function exportAsIndentedText(itemId: ItemId, indentLevel = 0): string {
  const line = '  '.repeat(indentLevel) + getContentAsPlainText(itemId) + '\n'
  if (NextState.isPage(itemId)) {
    return line
  }
  const childLines = NextState.getChildItemIds(itemId).map((childItemId) => {
    return exportAsIndentedText(childItemId, indentLevel + 1)
  })
  return line + childLines.join('')
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
