import {List} from 'immutable'
import {assertNeverType, assertNonNull} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {Edge} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

export function onCopy(event: ClipboardEvent) {
  doWithErrorCapture(() => {
    if (event.clipboardData === null) return

    External.instance.treeifyClipboard = undefined

    const textSelection = getTextItemSelectionFromDom()
    if (textSelection?.focusDistance !== textSelection?.anchorDistance) {
      // テキストが範囲選択されていればブラウザのデフォルトの動作に任せる
    } else {
      // テキストが範囲選択されていなければターゲットアイテムのコピーを行う
      event.preventDefault()

      // インデント形式のテキストをクリップボードに入れる
      const contentText = CurrentState.getSelectedItemPaths().map(exportAsIndentedText).join('\n')
      event.clipboardData.setData('text/plain', contentText)

      // OPML形式のテキストをクリップボードに入れる
      event.clipboardData.setData(
        'application/xml',
        toOpmlString(CurrentState.getSelectedItemPaths())
      )
    }
  })
}

export function onCut(event: ClipboardEvent) {
  doWithErrorCapture(() => {
    if (event.clipboardData === null) return

    External.instance.treeifyClipboard = undefined

    const textSelection = getTextItemSelectionFromDom()
    if (textSelection?.focusDistance !== textSelection?.anchorDistance) {
      // テキストが範囲選択されていればブラウザのデフォルトの動作に任せる
    } else {
      // テキストが範囲選択されていなければターゲットアイテムのコピーを行う
      event.preventDefault()

      // インデント形式のテキストをクリップボードに入れる
      const contentText = CurrentState.getSelectedItemPaths().map(exportAsIndentedText).join('\n')
      event.clipboardData.setData('text/plain', contentText)

      // OPML形式のテキストをクリップボードに入れる
      event.clipboardData.setData(
        'application/xml',
        toOpmlString(CurrentState.getSelectedItemPaths())
      )

      NullaryCommand.deleteItem()
      Rerenderer.instance.rerender()
    }
  })
}

// ペースト時にプレーンテキスト化する
export function onPaste(event: ClipboardEvent) {
  doWithErrorCapture(() => {
    if (event.clipboardData === null) return

    event.preventDefault()
    const targetItemPath = CurrentState.getTargetItemPath()

    const text = event.clipboardData.getData('text/plain')

    // 独自クリップボードを優先して貼り付ける
    if (External.instance.treeifyClipboard !== undefined) {
      // 独自クリップボードへのコピー後に他アプリ上で何かをコピーされた場合のガード
      if (text === External.instance.getTreeifyClipboardHash()) {
        // TODO: 兄弟リスト内に同一アイテムが複数含まれてしまう場合のエラー処理を追加する

        // TODO: selectedItemPathsは削除や移動されたアイテムを指している可能性がある
        for (const selectedItemPath of External.instance.treeifyClipboard.selectedItemPaths.reverse()) {
          const selectedItemId = ItemPath.getItemId(selectedItemPath)
          // 循環参照発生時を考慮して、トランスクルード時は必ずcollapsedとする
          const initialEdge: Edge = {isCollapsed: true, labels: List.of()}
          CurrentState.insertBelowItem(targetItemPath, selectedItemId, initialEdge)
        }

        Rerenderer.instance.rerender()
        return
      } else {
        External.instance.treeifyClipboard = undefined
      }
    }

    const opmlParseResult = tryParseAsOpml(getOpmlMimeTypeText(event.clipboardData))
    // OPML形式の場合
    if (opmlParseResult !== undefined) {
      for (const itemAndEdge of createItemsBasedOnOpml(opmlParseResult).reverse()) {
        CurrentState.insertBelowItem(targetItemPath, itemAndEdge.itemId, itemAndEdge.edge)
      }
      Rerenderer.instance.rerender()
      return
    }

    if (!text.includes('\n')) {
      // 1行だけのテキストの場合

      // GyazoのスクリーンショットのURLを判定する。
      // 'https://gyazo.com/'に続けてMD5の32文字が来る形式になっている模様。
      const gyazoUrlPattern = /https:\/\/gyazo\.com\/\w{32}/
      if (gyazoUrlPattern.test(text)) {
        // GyazoのスクリーンショットのURLなら画像アイテムを作る
        const newItemId = CurrentState.createImageItem()
        // TODO: Gyazoの画像はpngとは限らない
        CurrentState.setImageItemUrl(newItemId, text + '.png')
        CurrentState.insertBelowItem(targetItemPath, newItemId)
        Rerenderer.instance.rerender()
      } else {
        document.execCommand('insertText', false, text)
      }
    } else {
      // 複数行にわたるテキストの場合
      pasteMultilineText(text)
    }
  })
}

// OPMLの可能性があるMIMEタイプをいろいろ試してテキストを取り出す
function getOpmlMimeTypeText(dataTransfer: DataTransfer): string {
  const textXOpml = dataTransfer.getData('text/x-opml')
  if (textXOpml !== '') return textXOpml

  const applicationXml = dataTransfer.getData('application/xml')
  if (applicationXml !== '') return applicationXml

  const textXml = dataTransfer.getData('text/xml')
  if (textXml !== '') return textXml

  return dataTransfer.getData('text/plain')
}

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

/**
 * 与えられたテキストに含まれるURLを返す。
 * URLが見つからなかった場合はundefinedを返す。
 * 複数のURLが含まれる場合、最初に出てきたものを返す。
 * ChromeのタブのURLとして使われる可能性があるので、about:blank と chrome://* はURL扱いする。
 *
 * なおURLには仕様上()や[]が含まれていても許される。
 * そのためMarkdownやScrapboxのリンク記法をこの関数では正しく扱えないので注意。
 */
export function detectUrl(text: string): string | undefined {
  if (text.includes('about:blank')) {
    return 'about:blank'
  }

  const result = text.match(
    /(https?|file|chrome):\/\/[\w.,/:;'()\[\]%$&@#?!=+*~\-_\p{scx=Hiragana}\p{scx=Katakana}\p{sc=Han}}]+/u
  )
  if (result !== null) {
    return result[0]
  }

  return undefined
}

function toOpmlOutlineElement(itemPath: ItemPath, xmlDocument: XMLDocument): Element {
  const outlineElement = xmlDocument.createElement('outline')

  const attributes = toOpmlAttributes(itemPath)
  for (const attrName in attributes) {
    outlineElement.setAttribute(attrName, attributes[attrName])
  }

  const childItemIds = Internal.instance.state.items[ItemPath.getItemId(itemPath)].childItemIds
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
  const labels = CurrentState.getLabels(itemPath)
  if (!labels.isEmpty()) {
    baseAttributes.labels = JSON.stringify(labels.toArray())
  }

  switch (item.itemType) {
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
      break
    case ItemType.IMAGE:
      const imageItem = Internal.instance.state.imageItems[itemId]
      baseAttributes.type = 'image'
      baseAttributes.text = imageItem.caption
      baseAttributes.url = imageItem.url
      break
    case ItemType.CODE_BLOCK:
      const codeBlockItem = Internal.instance.state.codeBlockItems[itemId]
      baseAttributes.type = 'code-block'
      baseAttributes.text = codeBlockItem.code
      baseAttributes.language = codeBlockItem.language
      break
    default:
      assertNeverType(item.itemType)
  }

  return baseAttributes
}

/**
 * 指定されたアイテムとその子孫をOPML 2.0形式に変換する。
 * ページや折りたたまれたアイテムの子孫も含める。
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
function tryParseAsOpml(possiblyOpml: string): List<Element> | undefined {
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
// トランスクルージョンを復元するために、OPML内に出現したアイテムIDを記録しておくオブジェクト。
// KeyはOutlineElement要素のitemId属性の値。ValueはState内の実際に対応するアイテムID。
type ItemIdMap = {[K in string | number]: ItemId}

function createItemsBasedOnOpml(outlineElements: List<Element>): List<ItemAndEdge> {
  const itemIdMap = {}
  return outlineElements.map((element) => createItemBasedOnOpml(element, itemIdMap))
}

/** パースされたOPMLのoutline要素を元にアイテムを作る */
function createItemBasedOnOpml(outlineElement: Element, itemIdMap: ItemIdMap): ItemAndEdge {
  const attrItemId = outlineElement.getAttribute('itemId')
  const isCollapsed = outlineElement.getAttribute('isCollapsed') === 'true'
  const edge = {isCollapsed, labels: extractLabels(outlineElement)}
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

  return {itemId, edge}
}

function extractLabels(outlineElement: Element): List<string> {
  try {
    const attrLabels = outlineElement.getAttribute('labels')
    if (attrLabels !== null) {
      return List(JSON.parse(attrLabels))
    }
  } catch {
    return List.of()
  }
  return List.of()
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
      return webPageItemId
    case 'image':
      const imageItemId = CurrentState.createImageItem()
      CurrentState.setImageItemCaption(imageItemId, attrText)
      if (attrUrl !== null) {
        CurrentState.setImageItemUrl(imageItemId, attrUrl)
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
        const domishObject: DomishObject.TextNode = {
          type: 'text',
          textContent: attrText,
        }
        CurrentState.setTextItemDomishObjects(textItemId, List.of(domishObject))
      }
      return textItemId
  }
}
