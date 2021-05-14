import {List} from 'immutable'
import {assert, assertNeverType, assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {MarkedupText} from 'src/TreeifyWindow/Internal/MarkedupText'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {Edge} from 'src/TreeifyWindow/Internal/State'
import {Attributes, Element, js2xml, xml2js} from 'xml-js'

export function onCopy(event: ClipboardEvent) {
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
}

export function onCut(event: ClipboardEvent) {
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
    CurrentState.commit()
  }
}

// ペースト時にプレーンテキスト化する
export function onPaste(event: ClipboardEvent) {
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
        CurrentState.insertNextSiblingItem(targetItemPath, selectedItemId, initialEdge)
      }

      CurrentState.commit()
      return
    } else {
      External.instance.treeifyClipboard = undefined
    }
  }

  const opmlParseResult = tryParseAsOpml(getOpmlMimeTypeText(event.clipboardData))
  // OPML形式の場合
  if (opmlParseResult !== undefined) {
    for (const itemAndEdge of createItemsBasedOnOpml(opmlParseResult).reverse()) {
      CurrentState.insertNextSiblingItem(targetItemPath, itemAndEdge.itemId, itemAndEdge.edge)
    }
    CurrentState.commit()
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
      CurrentState.insertNextSiblingItem(targetItemPath, newItemId)
      CurrentState.commit()
    } else {
      document.execCommand('insertText', false, text)
    }
  } else {
    // 複数行にわたるテキストの場合
    pasteMultilineText(text)
  }
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
      return codeBlockItem.code.split('\n')[0]
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
        CurrentState.insertNextSiblingItem(CurrentState.getTargetItemPath(), rootItemId)
      }
      CurrentState.commit()
      return
    }
  }

  // 特に形式を認識できなかった場合、フラットな1行テキストの並びとして扱う
  for (const itemId of lines.map(createItemFromSingleLineText).reverse()) {
    CurrentState.insertNextSiblingItem(CurrentState.getTargetItemPath(), itemId)
  }
  CurrentState.commit()
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

function toOpmlOutlineElement(itemPath: ItemPath): Element {
  const itemId = ItemPath.getItemId(itemPath)
  const item = Internal.instance.state.items[itemId]

  return {
    type: 'element',
    name: 'outline',
    attributes: toOpmlAttributes(itemPath),
    elements: item.childItemIds
      .map((childItemId) => toOpmlOutlineElement(itemPath.push(childItemId)))
      .toArray(),
  }
}

function toOpmlAttributes(itemPath: ItemPath): Attributes {
  const itemId = ItemPath.getItemId(itemPath)
  const item = Internal.instance.state.items[itemId]

  const baseAttributes: Attributes = {
    isPage: CurrentState.isPage(itemId).toString(),
    itemId,
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
      const markedupText = MarkedupText.from(textItem.domishObjects)
      baseAttributes.type = 'text'
      baseAttributes.text = markedupText.text
      if (!markedupText.styles.isEmpty()) {
        baseAttributes.styles = JSON.stringify(markedupText.styles.toArray())
      }
      return baseAttributes
    case ItemType.WEB_PAGE:
      const webPageItem = Internal.instance.state.webPageItems[itemId]
      baseAttributes.type = 'link'
      baseAttributes.text = CurrentState.deriveWebPageItemTitle(itemId)
      baseAttributes.url = webPageItem.url
      baseAttributes.faviconUrl = webPageItem.faviconUrl
      if (webPageItem.title !== null) {
        baseAttributes.title = webPageItem.tabTitle
      }
      return baseAttributes
    case ItemType.IMAGE:
      const imageItem = Internal.instance.state.imageItems[itemId]
      baseAttributes.type = 'image'
      baseAttributes.text = imageItem.caption
      baseAttributes.url = imageItem.url
      return baseAttributes
    case ItemType.CODE_BLOCK:
      const codeBlockItem = Internal.instance.state.codeBlockItems[itemId]
      baseAttributes.type = 'code-block'
      baseAttributes.text = codeBlockItem.code
      baseAttributes.language = codeBlockItem.language
      return baseAttributes
    default:
      assertNeverType(item.itemType)
  }
}

/**
 * 指定されたアイテムとその子孫をOPML 2.0形式に変換する。
 * ページや折りたたまれたアイテムの子孫も含める。
 */
export function toOpmlString(itemPaths: List<ItemPath>): string {
  const xmlObject = {
    declaration: {
      attributes: {
        version: '1.0',
      },
    },
    elements: [
      {
        type: 'element',
        name: 'opml',
        attributes: {version: '2.0'},
        elements: [
          {
            type: 'element',
            name: 'head',
          },
          {
            type: 'element',
            name: 'body',
            elements: itemPaths.map(toOpmlOutlineElement).toArray(),
          },
        ],
      },
    ],
  }
  return js2xml(xmlObject, {spaces: 2})
}

/**
 * 指定された文字列をOPMLとしてパースしてみる。
 * 成功したらbody要素直下のoutline要素の配列を返す。
 * 失敗したらundefinedを返す。
 * OPML 2.0だと仮定してパースするが、1.0でも偶然パースできることはある。
 * TODO: head > title要素の内容をスルーしてしまっているが何らかの形で取り込んだ方がいいのでは
 */
export function tryParseAsOpml(couldXmlString: string): OutlineElement[] | undefined {
  try {
    const documentRoot = xml2js(couldXmlString)

    // バリデーション
    if (!(documentRoot.elements instanceof Array)) return undefined
    const opmlElement: Element = documentRoot.elements[0]
    assert(opmlElement.name === 'opml')
    if (!(opmlElement.elements instanceof Array)) return undefined
    const bodyElement = opmlElement.elements.find((element) => element.name === 'body')
    assertNonUndefined(bodyElement)
    if (!(bodyElement.elements instanceof Array)) return undefined
    for (const outlineElement of bodyElement.elements) {
      assertOutlineElement(outlineElement)
    }

    return bodyElement.elements as OutlineElement[]
  } catch {
    return undefined
  }
}

function assertOutlineElement(element: Element): asserts element is OutlineElement {
  assert(element.name === 'outline')
  assertNonUndefined(element.attributes)
  // textはOPML 2.0では必須属性
  assert(typeof element.attributes.text === 'string')

  if (element.elements instanceof Array) {
    // 再帰的に子孫をバリデーション
    for (const child of element.elements) {
      assertOutlineElement(child)
    }
  }
}

// typeによる型定義ではelementsのmap時の型でエラーが起こるのでinterfaceを使う
interface OutlineElement extends Element {
  attributes: OutlineAttributes
  elements?: Array<OutlineElement>
}
type OutlineAttributes = Attributes & {
  text: string
}
type ItemAndEdge = {itemId: ItemId; edge: Edge}
// トランスクルージョンを復元するために、OPML内に出現したアイテムIDを記録しておくオブジェクト。
// KeyはOutlineElement要素のitemId属性の値。ValueはState内の実際に対応するアイテムID。
type ItemIdMap = {[K in string | number]: ItemId}

function createItemsBasedOnOpml(elements: OutlineElement[]): ItemAndEdge[] {
  const itemIdMap = {}
  return elements.map((element) => createItemBasedOnOpml(element, itemIdMap))
}

/**
 * パースされたOPMLを元にアイテムを作る。
 * TODO: テキストアイテムのスタイル（太字、下線など）の取り込みは未実装
 */
function createItemBasedOnOpml(element: OutlineElement, itemIdMap: ItemIdMap): ItemAndEdge {
  const attributes = element.attributes
  const existingItemId = attributes.itemId !== undefined ? itemIdMap[attributes.itemId] : undefined
  if (existingItemId !== undefined) {
    if (attributes.isCollapsed === 'true') {
      return {itemId: existingItemId, edge: {isCollapsed: true, labels: List.of()}}
    } else {
      return {itemId: existingItemId, edge: {isCollapsed: false, labels: List.of()}}
    }
  }

  const itemId = createBaseItemBasedOnOpml(element)
  if (attributes.itemId !== undefined) {
    itemIdMap[attributes.itemId] = itemId
  }

  const children = element.elements?.map((child) => createItemBasedOnOpml(child, itemIdMap)) ?? []
  CurrentState.modifyChildItems(itemId, () => List(children).map((child) => child.itemId))
  for (const child of children) {
    CurrentState.addParent(child.itemId, itemId, child.edge)
  }

  if (typeof attributes.cssClass === 'string') {
    const cssClasses = List(attributes.cssClass.split(' '))
    CurrentState.setCssClasses(itemId, cssClasses)
  }
  if (attributes.isPage === 'true') {
    CurrentState.turnIntoPage(itemId)
  }

  if (attributes.isCollapsed === 'true') {
    return {itemId, edge: {isCollapsed: true, labels: List.of()}}
  } else {
    return {itemId, edge: {isCollapsed: false, labels: List.of()}}
  }
}

function createBaseItemBasedOnOpml(element: OutlineElement): ItemId {
  const attributes = element.attributes
  switch (attributes.type) {
    case 'link':
      const webPageItemId = CurrentState.createWebPageItem()
      if (typeof attributes.url === 'string') {
        CurrentState.setWebPageItemUrl(webPageItemId, attributes.url)
      }
      if (typeof attributes.faviconUrl === 'string') {
        CurrentState.setWebPageItemFaviconUrl(webPageItemId, attributes.faviconUrl)
      }
      if (typeof attributes.title === 'string') {
        CurrentState.setWebPageItemTabTitle(webPageItemId, attributes.title)
        CurrentState.setWebPageItemTitle(webPageItemId, attributes.text)
      } else {
        CurrentState.setWebPageItemTabTitle(webPageItemId, attributes.text)
      }
      return webPageItemId
    case 'image':
      const imageItemId = CurrentState.createImageItem()
      CurrentState.setImageItemCaption(imageItemId, attributes.text)
      if (typeof attributes.url === 'string') {
        CurrentState.setImageItemUrl(imageItemId, attributes.url)
      }
      return imageItemId
    case 'code-block':
      const codeBlockItemId = CurrentState.createCodeBlockItem()
      CurrentState.setCodeBlockItemCode(codeBlockItemId, attributes.text)
      if (typeof attributes.language === 'string') {
        CurrentState.setCodeBlockItemLanguage(codeBlockItemId, attributes.language)
      }
      return codeBlockItemId
    case 'text':
    default:
      const textItemId = CurrentState.createTextItem()
      // TODO: スタイル情報を取り込む
      const domishObject: DomishObject.TextNode = {
        type: 'text',
        textContent: attributes.text,
      }
      CurrentState.setTextItemDomishObjects(textItemId, List.of(domishObject))
      return textItemId
  }
}
