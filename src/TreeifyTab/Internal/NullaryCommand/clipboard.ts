import {assertNonUndefined} from 'src/Common/Debug/assert'
import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {toMarkdownText} from 'src/TreeifyTab/Internal/ImportExport/markdown'

/** 対象アイテムをMarkdown形式に変換し、クリップボードに入れる（text/plain） */
export function copyAsMarkdownText() {
  // TODO: 複数選択時はそれらをまとめてMarkdown化する
  const targetItemPath = CurrentState.getTargetItemPath()
  const blob = new Blob([toMarkdownText(targetItemPath)], {type: 'text/plain'})
  navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ])
}

/** トランスクルードするために独自クリップボードに情報を書き込む */
export async function copyForTransclusion() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  External.instance.treeifyClipboard = {selectedItemPaths}

  // 「独自クリップボードにコピー→他アプリで何かをコピー→Treeify上でペースト」としたとき、
  // 本来なら他アプリ由来のデータが貼り付けられるべきなのに独自クリップボードが優先されてしまう問題の対策。
  // クリップボードが上書きされたことを検出するために独自クリップボードのハッシュ値をクリップボードに書き込む。
  const treeifyClipboardHash = External.instance.getTreeifyClipboardHash()
  assertNonUndefined(treeifyClipboardHash)
  const blob = new Blob([treeifyClipboardHash], {type: 'text/plain'})
  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ])
}
