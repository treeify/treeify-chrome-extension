import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Edge } from 'src/TreeifyTab/Internal/State'
import { assertNeverType, assertNonNull } from 'src/Utility/Debug/assert'
import { RArray, RArray$ } from 'src/Utility/fp-ts'

function toOpmlOutlineElement(
  itemPath: ItemPath,
  xmlDocument: XMLDocument,
  includeInvisibleItems: boolean
): Element {
  const outlineElement = xmlDocument.createElement('outline')

  const attributes = toOpmlAttributes(itemPath)
  for (const [attrName, attrValue] of Object.entries(attributes)) {
    outlineElement.setAttribute(attrName, attrValue)
  }

  const childItemIds = includeInvisibleItems
    ? Internal.instance.state.items[ItemPath.getItemId(itemPath)].childItemIds
    : CurrentState.getDisplayingChildItemIds(itemPath)
  const children = childItemIds.map((childItemId) =>
    toOpmlOutlineElement(RArray$.append(childItemId)(itemPath), xmlDocument, includeInvisibleItems)
  )
  outlineElement.append(...children)

  return outlineElement
}

function toOpmlAttributes(itemPath: ItemPath): Record<string, string> {
  const itemId = ItemPath.getItemId(itemPath)
  const item = Internal.instance.state.items[itemId]

  const baseAttributes: Record<string, string> = {}
  if (CurrentState.countParents(itemId) > 1) {
    baseAttributes.id = itemId.toString()
  }
  if (CurrentState.isPage(itemId)) {
    baseAttributes.isPage = 'true'
  }
  if (ItemPath.hasParent(itemPath)) {
    baseAttributes.isFolded = CurrentState.getIsFolded(itemPath).toString()
  }
  if (item.cssClasses.length > 0) {
    baseAttributes.cssClass = item.cssClasses.join(' ')
  }
  if (item.source !== null) {
    baseAttributes.sourceTitle = item.source.title
    baseAttributes.sourceUrl = item.source.url
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
      baseAttributes.caption = codeBlockItem.caption
      break
    case ItemType.TEX:
      const texItem = Internal.instance.state.texItems[itemId]
      baseAttributes.type = 'tex'
      baseAttributes.text = texItem.code
      baseAttributes.caption = texItem.caption
      break
    default:
      assertNeverType(item.type)
  }

  return baseAttributes
}

/** 指定された項目とその子孫をOPML 2.0形式に変換する */
export function toOpmlString(
  itemPaths: RArray<ItemPath>,
  includeInvisibleItems: boolean = true
): string {
  const xmlDocument = document.implementation.createDocument(null, 'opml')
  const opmlElement = xmlDocument.documentElement
  opmlElement.setAttribute('version', '2.0')

  const headElement = xmlDocument.createElement('head')
  opmlElement.append(headElement)

  const formatElement = xmlDocument.createElement('format')
  formatElement.setAttribute('name', 'Treeify')
  formatElement.setAttribute('version', '1.0')
  headElement.append(formatElement)

  const bodyElement = xmlDocument.createElement('body')
  bodyElement.append(
    ...itemPaths.map((itemPath) =>
      toOpmlOutlineElement(itemPath, xmlDocument, includeInvisibleItems)
    )
  )
  opmlElement.append(bodyElement)

  const xmlString = new XMLSerializer().serializeToString(xmlDocument)
  // OPML内に制御文字が混入して正常に読み込めなくなる不具合の対策。
  // 下記を除く全ての制御文字を削除する。
  // ・x09(HT)
  // ・x0A(LF)
  // ・x0D(CR)
  // ・x80-x9F
  const safeXmlString = xmlString.replaceAll(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  // XML宣言が付いていない場合は付ける
  if (safeXmlString.startsWith('<?xml')) {
    return safeXmlString
  } else {
    return '<?xml version="1.0"?>' + safeXmlString
  }
}

/**
 * 基本的にOPML 2.0を想定したバリデーションを行うが、
 * head要素を要求せず、さらにopml要素のversion属性が2.0であることを要求しないので、
 * OPML 1.0文書でもパースに成功する場合がある（意図通り）。
 */
export function tryParseAsOpml(possiblyOpml: string): RArray<Element> | undefined {
  // OPML内に制御文字が混入しているとエラーになるのでその対策。
  // 下記を除く全ての制御文字を削除する。
  // ・x09(HT)
  // ・x0A(LF)
  // ・x0D(CR)
  // ・x80-x9F
  const safeText = possiblyOpml.replaceAll(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  const doc = new DOMParser().parseFromString(safeText, 'text/xml')

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

  return Array.from(topLevelElements)
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

type ItemAndEdge = { itemId: ItemId; edge: Edge }
// トランスクルージョンを復元するために、OPML内に出現した項目IDを記録しておくオブジェクト。
// KeyはOutlineElement要素のitemId属性の値。ValueはState内の実際に対応する項目ID。
type ItemIdMap = Record<string | number, ItemId>

export function createItemsBasedOnOpml(outlineElements: RArray<Element>): RArray<ItemAndEdge> {
  const itemIdMap = {}
  return outlineElements.map((element) => createItemBasedOnOpml(element, itemIdMap))
}

/** パースされたOPMLのoutline要素を元に項目を作る */
function createItemBasedOnOpml(outlineElement: Element, itemIdMap: ItemIdMap): ItemAndEdge {
  const attrItemId = outlineElement.getAttribute('id')
  const isFolded = deriveIsFolded(outlineElement)
  const edge = { isFolded }
  const existingItemId = attrItemId !== null ? itemIdMap[attrItemId] : undefined
  if (existingItemId !== undefined) {
    return { itemId: existingItemId, edge }
  }

  const itemId = createBaseItemBasedOnOpml(outlineElement)
  if (attrItemId !== null) {
    itemIdMap[attrItemId] = itemId
  }

  const children = Array.from(outlineElement.children).map((child) =>
    createItemBasedOnOpml(child, itemIdMap)
  )
  CurrentState.modifyChildItems(itemId, () => children.map((child) => child.itemId))
  for (const child of children) {
    CurrentState.addParent(child.itemId, itemId, child.edge)
  }

  const attrCssClass = outlineElement.getAttribute('cssClass')
  if (attrCssClass !== null) {
    CurrentState.setCssClasses(itemId, attrCssClass.split(' '))
  }

  if (outlineElement.getAttribute('isPage') === 'true') {
    CurrentState.turnIntoPage(itemId)
  }

  const attrSourceTitle = outlineElement.getAttribute('sourceTitle')
  const attrSourceUrl = outlineElement.getAttribute('sourceUrl')
  if (attrSourceTitle !== null || attrSourceUrl !== null) {
    CurrentState.setSource(itemId, {
      title: attrSourceTitle ?? '',
      url: attrSourceUrl ?? '',
    })
  }

  return { itemId, edge }
}

/**
 * isFolded属性が"true"ならtrueを返す。
 * isFolded属性が存在しない場合、子要素の数が6以上ならtrueを返す（大きな項目を自動で折りたたむ機能）。
 * 【大きな項目を自動で折りたたむ機能の採用理由】
 * WorkFlowyやDynalistからエクスポートしたOPMLデータには折りたたみ情報が含まれていない。
 * それらのアウトライナーからは巨大なOPMLデータがエクスポートされる場合があるので、
 * そのままTreeifyにインポートするとひどい目に合う。
 */
function deriveIsFolded(outlineElement: Element): boolean {
  const attrIsFolded = outlineElement.getAttribute('isFolded')
  if (attrIsFolded !== null) {
    return attrIsFolded === 'true'
  } else {
    return outlineElement.childElementCount >= 6
  }
}

function createBaseItemBasedOnOpml(outlineElement: Element): ItemId {
  const attrText = outlineElement.getAttribute('text')
  assertNonNull(attrText)
  const attrUrl = outlineElement.getAttribute('url')
  const attrCaption = outlineElement.getAttribute('caption')

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
          CurrentState.setImageItemWidthPx(imageItemId, Number(attrWidthPx))
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

      if (attrCaption !== null) {
        CurrentState.setCodeBlockItemCaption(codeBlockItemId, attrCaption)
      }

      return codeBlockItemId
    case 'tex':
      const texItemId = CurrentState.createTexItem()
      CurrentState.setTexItemCode(texItemId, attrText)

      if (attrCaption !== null) {
        CurrentState.setTexItemCaption(texItemId, attrCaption)
      }

      return texItemId
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
