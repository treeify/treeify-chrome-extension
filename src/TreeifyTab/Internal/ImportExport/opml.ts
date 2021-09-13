import {List} from 'immutable'
import {assertNeverType, assertNonNull} from 'src/Common/Debug/assert'
import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyTab/Internal/DomishObject'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {Edge, ExportFormat} from 'src/TreeifyTab/Internal/State'

function toOpmlOutlineElement(itemPath: ItemPath, xmlDocument: XMLDocument): Element {
  const outlineElement = xmlDocument.createElement('outline')

  const attributes = toOpmlAttributes(itemPath)
  for (const attrName in attributes) {
    outlineElement.setAttribute(attrName, attributes[attrName])
  }

  const state = Internal.instance.state
  const childItemIds = state.exportSettings.options[ExportFormat.OPML].ignoreInvisibleItems
    ? CurrentState.getDisplayingChildItemIds(itemPath)
    : state.items[ItemPath.getItemId(itemPath)].childItemIds
  const children = childItemIds.map((childItemId) =>
    toOpmlOutlineElement(itemPath.push(childItemId), xmlDocument)
  )
  outlineElement.append(...children)

  return outlineElement
}

function toOpmlAttributes(itemPath: ItemPath): {[T in string]: string} {
  const itemId = ItemPath.getItemId(itemPath)
  const item = Internal.instance.state.items[itemId]

  const baseAttributes: {[T in string]: string} = {
    isPage: CurrentState.isPage(itemId).toString(),
    itemId: itemId.toString(),
  }
  if (ItemPath.hasParent(itemPath)) {
    baseAttributes.isCollapsed = CurrentState.getIsCollapsed(itemPath).toString()
  }
  if (!item.cssClasses.isEmpty()) {
    baseAttributes.cssClass = item.cssClasses.join(' ')
  }

  if (item.cite !== null) {
    baseAttributes.citeTitle = item.cite.title
    baseAttributes.citeUrl = item.cite.url
  }

  if (item.view.type !== 'list') {
    baseAttributes.view = JSON.stringify(item.view)
  }

  switch (item.type) {
    case ItemType.TEXT:
      const textItem = Internal.instance.state.textItems[itemId]
      baseAttributes.type = 'text'
      baseAttributes.text = DomishObject.toPlainText(textItem.domishObjects)
      if (!DomishObject.isPlainText(textItem.domishObjects)) {
        baseAttributes.html = DomishObject.toHtml(textItem.domishObjects)
      }
      break
    case ItemType.WEB_PAGE:
      const webPageItem = Internal.instance.state.webPageItems[itemId]
      baseAttributes.type = 'link'
      baseAttributes.text = CurrentState.deriveWebPageItemTitle(itemId)
      baseAttributes.url = webPageItem.url
      baseAttributes.faviconUrl = webPageItem.faviconUrl
      if (webPageItem.title !== null) {
        baseAttributes.title = webPageItem.tabTitle
      }
      if (webPageItem.isUnread) {
        baseAttributes.isUnread = 'true'
      }
      break
    case ItemType.IMAGE:
      const imageItem = Internal.instance.state.imageItems[itemId]
      baseAttributes.type = 'image'
      if (imageItem.caption !== '') {
        baseAttributes.text = imageItem.caption
      } else {
        baseAttributes.text = imageItem.url
      }
      baseAttributes.url = imageItem.url
      if (imageItem.widthPx !== null) {
        baseAttributes.widthPx = imageItem.widthPx.toString()
      }
      break
    case ItemType.CODE_BLOCK:
      const codeBlockItem = Internal.instance.state.codeBlockItems[itemId]
      baseAttributes.type = 'code-block'
      baseAttributes.text = codeBlockItem.code
      baseAttributes.language = codeBlockItem.language
      break
    case ItemType.TEX:
      const texItem = Internal.instance.state.texItems[itemId]
      baseAttributes.type = 'tex'
      baseAttributes.text = texItem.code
      break
    default:
      assertNeverType(item.type)
  }

  return baseAttributes
}

/**
 * 指定された項目とその子孫をOPML 2.0形式に変換する。
 * ページや折りたたまれた項目の子孫も含める。
 */
export function toOpmlString(itemPaths: List<ItemPath>): string {
  const xmlDocument = document.implementation.createDocument(null, 'opml')
  const opmlElement = xmlDocument.documentElement
  opmlElement.setAttribute('version', '2.0')

  const headElement = xmlDocument.createElement('head')
  opmlElement.append(headElement)

  const bodyElement = xmlDocument.createElement('body')
  bodyElement.append(...itemPaths.map((itemPath) => toOpmlOutlineElement(itemPath, xmlDocument)))
  opmlElement.append(bodyElement)

  const xmlString = new XMLSerializer().serializeToString(xmlDocument)
  // XML宣言が付いていない場合は付ける
  if (xmlString.startsWith('<?xml')) {
    return xmlString
  } else {
    return '<?xml version="1.0"?>' + xmlString
  }
}

/**
 * 基本的にOPML 2.0を想定したバリデーションを行うが、
 * head要素を要求せず、さらにopml要素のversion属性が2.0であることを要求しないので、
 * OPML 1.0文書でもパースに成功する場合がある（意図通り）。
 */
export function tryParseAsOpml(possiblyOpml: string): List<Element> | undefined {
  const doc = new DOMParser().parseFromString(possiblyOpml, 'text/xml')

  // 以下、OPMLフォーマットバリデーション
  const opmlElement = doc.documentElement
  if (opmlElement.tagName !== 'opml') return undefined

  if (doc.getElementsByTagName('opml').length !== 1) return undefined

  const bodyElements = doc.getElementsByTagName('body')
  if (bodyElements.length !== 1) return undefined

  const bodyElement = bodyElements.item(0)!
  if (bodyElement.parentNode !== opmlElement) return undefined

  const topLevelElements = bodyElement.children
  if (topLevelElements.length === 0) return undefined

  for (const Element of topLevelElements) {
    if (!isValidOutlineElement(Element)) return undefined
  }

  return List(topLevelElements)
}

function isValidOutlineElement(possiblyOutlineElement: Element): boolean {
  if (possiblyOutlineElement.tagName !== 'outline') return false

  // textはOPML 2.0では必須属性。
  // TreeifyはOPML 2.0を強要はしないものの、text属性が無いと動作が複雑化するので必須属性としている。
  if (!possiblyOutlineElement.hasAttribute('text')) return false

  for (const childElement of possiblyOutlineElement.children) {
    if (!isValidOutlineElement(childElement)) return false
  }

  return true
}

type ItemAndEdge = {itemId: ItemId; edge: Edge}
// トランスクルージョンを復元するために、OPML内に出現した項目IDを記録しておくオブジェクト。
// KeyはOutlineElement要素のitemId属性の値。ValueはState内の実際に対応する項目ID。
type ItemIdMap = {[K in string | number]: ItemId}

export function createItemsBasedOnOpml(outlineElements: List<Element>): List<ItemAndEdge> {
  const itemIdMap = {}
  return outlineElements.map((element) => createItemBasedOnOpml(element, itemIdMap))
}

/** パースされたOPMLのoutline要素を元に項目を作る */
function createItemBasedOnOpml(outlineElement: Element, itemIdMap: ItemIdMap): ItemAndEdge {
  const attrItemId = outlineElement.getAttribute('itemId')
  const isCollapsed = outlineElement.getAttribute('isCollapsed') === 'true'
  const edge = {isCollapsed}
  const existingItemId = attrItemId !== null ? itemIdMap[attrItemId] : undefined
  if (existingItemId !== undefined) {
    return {itemId: existingItemId, edge}
  }

  const itemId = createBaseItemBasedOnOpml(outlineElement)
  if (attrItemId !== null) {
    itemIdMap[attrItemId] = itemId
  }

  const children = List(outlineElement.children).map((child) =>
    createItemBasedOnOpml(child, itemIdMap)
  )
  CurrentState.modifyChildItems(itemId, () => children.map((child) => child.itemId))
  for (const child of children) {
    CurrentState.addParent(child.itemId, itemId, child.edge)
  }

  const attrCssClass = outlineElement.getAttribute('cssClass')
  if (attrCssClass !== null) {
    const cssClasses = List(attrCssClass.split(' '))
    CurrentState.setCssClasses(itemId, cssClasses)
  }

  if (outlineElement.getAttribute('isPage') === 'true') {
    CurrentState.turnIntoPage(itemId)
  }

  const attrCiteTitle = outlineElement.getAttribute('citeTitle')
  const attrCiteUrl = outlineElement.getAttribute('citeUrl')
  if (attrCiteTitle !== null || attrCiteUrl !== null) {
    CurrentState.setCite(itemId, {
      title: attrCiteTitle ?? '',
      url: attrCiteUrl ?? '',
    })
  }

  const attrView = outlineElement.getAttribute('view')
  if (attrView !== null) {
    try {
      // TODO: ViewTypeのバリデーション
      CurrentState.setView(itemId, JSON.parse(attrView))
    } catch {}
  }

  return {itemId, edge}
}

function createBaseItemBasedOnOpml(outlineElement: Element): ItemId {
  const attrText = outlineElement.getAttribute('text')
  assertNonNull(attrText)
  const attrUrl = outlineElement.getAttribute('url')

  switch (outlineElement.getAttribute('type')) {
    case 'link':
      const webPageItemId = CurrentState.createWebPageItem()
      if (attrUrl !== null) {
        CurrentState.setWebPageItemUrl(webPageItemId, attrUrl)
      }
      const attrFaviconUrl = outlineElement.getAttribute('faviconUrl')
      if (attrFaviconUrl !== null) {
        CurrentState.setWebPageItemFaviconUrl(webPageItemId, attrFaviconUrl)
      }
      const attrTitle = outlineElement.getAttribute('title')
      if (attrTitle !== null) {
        CurrentState.setWebPageItemTabTitle(webPageItemId, attrTitle)
        CurrentState.setWebPageItemTitle(webPageItemId, attrText)
      } else {
        CurrentState.setWebPageItemTabTitle(webPageItemId, attrText)
      }
      const attrIsUnread = outlineElement.getAttribute('isUnread')
      if (attrIsUnread === 'true') {
        CurrentState.setIsUnreadFlag(webPageItemId, true)
      }
      return webPageItemId
    case 'image':
      const imageItemId = CurrentState.createImageItem()
      if (attrText !== attrUrl) {
        CurrentState.setImageItemCaption(imageItemId, attrText)
      }
      if (attrUrl !== null) {
        CurrentState.setImageItemUrl(imageItemId, attrUrl)
      }
      const attrWidthPx = outlineElement.getAttribute('widthPx')
      if (attrWidthPx !== null) {
        try {
          CurrentState.setImageItemWidthPx(imageItemId, parseInt(attrWidthPx))
        } catch {}
      }
      return imageItemId
    case 'code-block':
      const codeBlockItemId = CurrentState.createCodeBlockItem()
      CurrentState.setCodeBlockItemCode(codeBlockItemId, attrText)
      const attrLanguage = outlineElement.getAttribute('language')
      if (attrLanguage !== null) {
        CurrentState.setCodeBlockItemLanguage(codeBlockItemId, attrLanguage)
      }
      return codeBlockItemId
    case 'text':
    default:
      const textItemId = CurrentState.createTextItem()
      const attrHtml = outlineElement.getAttribute('html')
      if (attrHtml !== null) {
        // html属性がある場合はパースして使う
        const domishObjects = DomishObject.fromHtml(attrHtml)
        CurrentState.setTextItemDomishObjects(textItemId, domishObjects)
      } else {
        // html属性がない場合はtext属性をプレーンテキストとして使う
        const domishObjects = DomishObject.fromPlainText(attrText)
        CurrentState.setTextItemDomishObjects(textItemId, domishObjects)
      }
      return textItemId
  }
}
