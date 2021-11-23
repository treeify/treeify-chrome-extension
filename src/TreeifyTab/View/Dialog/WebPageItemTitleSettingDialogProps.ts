import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import { assertNonUndefined } from 'src/Utility/Debug/assert'

export type WebPageItemTitleSettingDialogProps = {
  rect: DOMRect
  /** タイトル入力欄のテキストの初期値 */
  initialTitle: string
  onKeyDown: (event: KeyboardEvent) => void
}

export function createWebPageItemTitleSettingDialogProps(): WebPageItemTitleSettingDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)

  const domElementId = MainAreaContentView.focusableDomElementId(targetItemPath)
  const rect = document
    .getElementById(domElementId)
    ?.querySelector('.main-area-web-page-content_title')
    ?.getBoundingClientRect()
  assertNonUndefined(rect)

  return {
    rect,
    initialTitle: CurrentState.deriveWebPageItemTitle(targetItemId),
    onKeyDown: (event) => {
      if (event.isComposing) return

      if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
        if (event.target.value === '') {
          // 入力欄が空の状態でEnterキーを押したらタイトル設定を削除する
          CurrentState.setWebPageItemTitle(targetItemId, null)
        } else {
          CurrentState.setWebPageItemTitle(targetItemId, event.target.value)
        }
        // タイトル設定ダイアログを閉じる
        External.instance.dialogState = undefined
        Rerenderer.instance.rerender()
      }

      if (InputId.fromKeyboardEvent(event) === '0000Escape') {
        External.instance.dialogState = undefined
        Rerenderer.instance.rerender()
      }
    },
  }
}
