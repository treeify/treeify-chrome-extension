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
