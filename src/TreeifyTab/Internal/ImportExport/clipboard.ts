import { getTextItemSelectionFromDom } from 'src/TreeifyTab/External/domTextSelection'
import { External } from 'src/TreeifyTab/External/External'
import { Command } from 'src/TreeifyTab/Internal/Command'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import {
  exportAsIndentedText,
  pasteMultilineText,
} from 'src/TreeifyTab/Internal/ImportExport/indentedText'
import {
  createItemsBasedOnOpml,
  toOpmlString,
  tryParseAsOpml,
} from 'src/TreeifyTab/Internal/ImportExport/opml'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Edge } from 'src/TreeifyTab/Internal/State'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { assertNonUndefined } from 'src/Utility/Debug/assert'

export function onCopy(event: ClipboardEvent) {
  if (event.clipboardData === null) return

  External.instance.treeifyClipboard = undefined

  if (getSelection()?.isCollapsed === false) {
    // テキストが範囲選択されていればブラウザのデフォルトの動作に任せる
  } else {
    // テキストが範囲選択されていなければターゲット項目のコピーを行う
    event.preventDefault()

    const selectedItemPaths = CurrentState.getSelectedItemPaths()
    // インデント形式のテキストをクリップボードに入れる
    const contentText = selectedItemPaths.map(exportAsIndentedText).join('\n')
    event.clipboardData.setData('text/plain', contentText)

    // OPML形式のテキストをクリップボードに入れる
    event.clipboardData.setData('application/xml', toOpmlString(selectedItemPaths))
  }
}

export function onCut(event: ClipboardEvent) {
  if (event.clipboardData === null) return

  Internal.instance.saveCurrentStateToUndoStack()

  External.instance.treeifyClipboard = undefined

  if (getSelection()?.isCollapsed === false) {
    // テキストが範囲選択されている場合

    Internal.instance.saveCurrentStateToUndoStack()
    // あとはブラウザのデフォルトの動作に任せる
  } else {
    // テキストが範囲選択されていなければターゲット項目のコピーを行う
    event.preventDefault()

    const selectedItemPaths = CurrentState.getSelectedItemPaths()
    // インデント形式のテキストをクリップボードに入れる
    const contentText = selectedItemPaths.map(exportAsIndentedText).join('\n')
    event.clipboardData.setData('text/plain', contentText)

    // OPML形式のテキストをクリップボードに入れる
    event.clipboardData.setData('application/xml', toOpmlString(selectedItemPaths))

    Command.removeItem()
    Rerenderer.instance.rerender()
  }
}

export function onPaste(event: ClipboardEvent) {
  if (event.clipboardData === null) return

  Internal.instance.saveCurrentStateToUndoStack()

  event.preventDefault()
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)

  const text = event.clipboardData.getData('text/plain').replace(/\r?\n$/, '')

  // 独自クリップボードを優先して貼り付ける
  if (External.instance.treeifyClipboard !== undefined) {
    // 独自クリップボードへのコピー後に他アプリ上で何かをコピーされた場合のガード
    if (text === External.instance.getTreeifyClipboardHash()) {
      // TODO: selectedItemPathsは削除や移動された項目を指している可能性がある
      for (const selectedItemPath of External.instance.treeifyClipboard.selectedItemPaths.reverse()) {
        // 兄弟リスト内に同一項目を入れてしまわないようガード
        if (!CurrentState.isSibling(selectedItemPath, targetItemPath)) {
          const selectedItemId = ItemPath.getItemId(selectedItemPath)
          const initialEdge: Edge = { isFolded: CurrentState.getIsFolded(selectedItemPath) }
          CurrentState.insertBelowItem(targetItemPath, selectedItemId, initialEdge)
        }
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

  if (!text.includes('\n')) {
    // 1行だけのテキストの場合

    // GyazoのスクリーンショットのURLを判定する。
    // 'https://gyazo.com/'に続けてMD5の32文字が来る形式になっている模様。
    const gyazoUrlPattern = /https:\/\/gyazo\.com\/\w{32}/
    if (gyazoUrlPattern.test(text)) {
      // GyazoのスクリーンショットのURLなら画像項目を作る
      const newItemId = CurrentState.createImageItem()
      CurrentState.setImageItemUrl(newItemId, getGyazoImageUrl(text))
      const belowItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)

      // ターゲットを更新する
      CurrentState.setTargetItemPath(belowItemPath)

      // 空のテキスト項目上で実行した場合は空のテキスト項目を削除する
      if (CurrentState.isEmptyTextItem(targetItemId)) {
        CurrentState.deleteItem(targetItemId)
      }

      Rerenderer.instance.rerender()
    } else if (getTextItemSelectionFromDom() !== undefined) {
      Internal.instance.saveCurrentStateToUndoStack()
      document.execCommand('insertText', false, text)
    } else {
      const newItemId = CurrentState.createTextItem()
      CurrentState.setTextItemDomishObjects(newItemId, DomishObject.fromPlainText(text))
      const belowItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)

      // ターゲットを更新する
      CurrentState.setTargetItemPath(belowItemPath)

      // 空のテキスト項目上で実行した場合は空のテキスト項目を削除する
      if (CurrentState.isEmptyTextItem(targetItemId)) {
        CurrentState.deleteItem(targetItemId)
      }

      Rerenderer.instance.rerender()
    }
  } else {
    // 複数行にわたるテキストの場合
    pasteMultilineText(text)
  }
}

/** 画像のURL（直リンク）かどうかを同期XHRで判定する */
function isImageUrl(url: string): boolean {
  const xhr = new XMLHttpRequest()
  xhr.open('HEAD', url, false)
  xhr.send(null)
  const contentType = xhr.getResponseHeader('content-type')
  return contentType?.startsWith('image/') ?? false
}

function getGyazoImageUrl(gyazoUrl: string): string {
  if (isImageUrl(gyazoUrl + '.png')) {
    return gyazoUrl + '.png'
  }
  return gyazoUrl + '.jpg'
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
