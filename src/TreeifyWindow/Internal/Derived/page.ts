import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {getContentAsPlainText} from 'src/TreeifyWindow/Internal/importAndExport'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {Readable} from 'svelte/store'

/** Treeifyウィンドウのタイトルとして表示する文字列を返す */
export function generateTreeifyWindowTitle(): Readable<string> {
  return Internal.d(() => getContentAsPlainText(CurrentState.getActivePageId()))
}
