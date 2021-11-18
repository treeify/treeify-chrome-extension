import { assertNonUndefined } from 'src/Common/Debug/assert'
import { getTextItemSelectionFromDom } from 'src/TreeifyTab/External/domTextSelection'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'

/** トランスクルードするために独自クリップボードに情報を書き込む */
export async function copyForTransclusion() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  External.instance.treeifyClipboard = { selectedItemPaths }

  // 「独自クリップボードにコピー→他アプリで何かをコピー→Treeify上でペースト」としたとき、
  // 本来なら他アプリ由来のデータが貼り付けられるべきなのに独自クリップボードが優先されてしまう問題の対策。
  // クリップボードが上書きされたことを検出するために独自クリップボードのハッシュ値をクリップボードに書き込む。
  const treeifyClipboardHash = External.instance.getTreeifyClipboardHash()
  assertNonUndefined(treeifyClipboardHash)
  await navigator.clipboard.writeText(treeifyClipboardHash)
}

export async function pasteAsPlainText() {
  const text = await navigator.clipboard.readText()

  const textItemSelection = getTextItemSelectionFromDom()
  if (textItemSelection !== undefined) {
    // テキスト項目がフォーカスを持っている場合

    // 改行付きテキストをそのままinsertTextするとdiv要素やp要素が出現してしまうので、強制的にbr要素にする
    const lines = text.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      document.execCommand('insertText', false, lines[i])
      if (i !== lines.length - 1) {
        document.execCommand('insertLineBreak')
      }
    }
  } else {
    // テキスト項目がフォーカスを持っていない場合

    const newTextItem = CurrentState.createTextItem()
    CurrentState.setTextItemDomishObjects(newTextItem, DomishObject.fromPlainText(text))
    CurrentState.insertBelowItem(CurrentState.getTargetItemPath(), newTextItem)

    // このコマンドは非同期コマンドなのでこのタイミングで再描画が必要
    Rerenderer.instance.rerender()
  }
}
