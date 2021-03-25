import {integer, ItemId, ItemType} from 'src/Common/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {DomishObject} from 'src/Common/DomishObject'
import {assertNeverType} from 'src/Common/Debug/assert'
import {List} from 'immutable'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'

export function onCopy(event: ClipboardEvent) {
  if (event.clipboardData === null) return

  const textSelection = getTextItemSelectionFromDom()
  if (textSelection?.focusDistance !== textSelection?.anchorDistance) {
    // テキストが範囲選択されていればブラウザのデフォルトの動作に任せる
  } else {
    // テキストが範囲選択されていなければターゲットアイテムのコピーを行う
    event.preventDefault()
    const contentText = CurrentState.exportAsIndentedText(
      ItemPath.getItemId(CurrentState.getTargetItemPath())
    )
    event.clipboardData.setData('text/plain', contentText)
  }
}

export function onCut(event: ClipboardEvent) {
  if (event.clipboardData === null) return

  const textSelection = getTextItemSelectionFromDom()
  if (textSelection?.focusDistance !== textSelection?.anchorDistance) {
    // テキストが範囲選択されていればブラウザのデフォルトの動作に任せる
  } else {
    // テキストが範囲選択されていなければターゲットアイテムのコピーを行う
    event.preventDefault()
    const contentText = CurrentState.exportAsIndentedText(
      ItemPath.getItemId(CurrentState.getTargetItemPath())
    )
    event.clipboardData.setData('text/plain', contentText)

    NullaryCommand.deleteItem()
    CurrentState.commit()
  }
}

// ペースト時にプレーンテキスト化する
export function onPaste(event: ClipboardEvent) {
  if (event.clipboardData === null) return

  event.preventDefault()
  const text = event.clipboardData.getData('text/plain')
  if (!text.includes('\n')) {
    // 1行だけのテキストの場合

    const url = detectUrl(text)
    if (url !== undefined) {
      // URLを含むなら
      const newItemId = createItemFromSingleLineText(text)
      CurrentState.insertNextSiblingItem(CurrentState.getTargetItemPath(), newItemId)
      CurrentState.commit()
    } else {
      document.execCommand('insertText', false, text)
    }
  } else {
    // 複数行にわたるテキストの場合
    pasteMultilineText(text)
  }
}

/** 指定されたアイテムを頂点とするインデント形式のプレーンテキストを作る */
export function exportAsIndentedText(itemId: ItemId): string {
  return exportAsIndentedLines(itemId).join('\n')
}

function exportAsIndentedLines(itemId: ItemId, indentLevel = 0): List<string> {
  const line = '  '.repeat(indentLevel) + getContentAsPlainText(itemId)
  if (CurrentState.isPage(itemId)) {
    return List.of(line)
  }
  const childLines = Internal.instance.state.items[itemId].childItemIds.flatMap((childItemId) => {
    return exportAsIndentedLines(childItemId, indentLevel + 1)
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
      const title = webPageItem.title ?? webPageItem.title
      const url = webPageItem.url
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

// TODO: URLが画像かどうか判定するためにasyncにしなければならないかも
export function createItemFromSingleLineText(line: string): ItemId {
  const url = detectUrl(line)
  if (url !== undefined) {
    // URLが含まれている場合

    // ウェブページアイテムを作る
    const title = line.replace(url, '').trim()
    const itemId = CurrentState.createWebPageItem()
    CurrentState.setWebPageItemTitle(itemId, title)
    CurrentState.setWebPageItemUrl(itemId, url)
    return itemId
  } else {
    // URLが含まれていない場合

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
}

/**
 * 与えられたテキストに含まれるURLを返す。
 * URLが見つからなかった場合はundefinedを返す。
 * 複数のURLが含まれる場合、最初に出てきたものを返す。
 * ChromeのタブのURLとして使われる可能性があるので、about:blank と chrome://* はURL扱いする。
 *
 * なおURLには仕様上()や[]が含まれていても許される。
 * そのためMarkdownやScrapboxのリンク記法をこの関数では正しく扱えないので注意。
 * TODO: いわゆる日本語ドメイン名に対応する
 */
export function detectUrl(text: string): string | undefined {
  if (text.includes('about:blank')) {
    return 'about:blank'
  }

  const result = text.match(/(https?|file|chrome):\/\/[\w.,/:;'()\[\]%$&@#?!=+*~\-_]+/)
  if (result !== null) {
    return result[0]
  }

  return undefined
}
