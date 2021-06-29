import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {WebPageItemTitleSettingDialog} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

export type WebPageItemTitleSettingDialogProps = {
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialog
  /** タイトル入力欄のテキストの初期値 */
  initialTitle: string
  onKeyDown: (event: KeyboardEvent) => void
}

export function createWebPageItemTitleSettingDialogProps(
  dialog: WebPageItemTitleSettingDialog
): WebPageItemTitleSettingDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)

  return {
    webPageItemTitleSettingDialog: dialog,
    initialTitle: CurrentState.deriveWebPageItemTitle(targetItemId),
    onKeyDown: (event) => {
      doWithErrorCapture(() => {
        if (event.isComposing) return

        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
          if (event.target.value === '') {
            // 入力欄が空の状態でEnterキーを押したらタイトル設定を削除する
            CurrentState.setWebPageItemTitle(targetItemId, null)
          } else {
            CurrentState.setWebPageItemTitle(targetItemId, event.target.value)
          }
          // タイトル設定ダイアログを閉じる
          CurrentState.setDialog(null)
          Rerenderer.instance.rerender()
        }

        if (InputId.fromKeyboardEvent(event) === '0000Escape') {
          CurrentState.setDialog(null)
          Rerenderer.instance.rerender()
        }
      })
    },
  }
}
