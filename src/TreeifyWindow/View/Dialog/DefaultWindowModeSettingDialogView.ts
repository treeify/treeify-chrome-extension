import {html} from 'lit-html'
import {assertNonNull} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {
  DefaultWindowMode,
  DefaultWindowModeSettingDialog,
  State,
} from 'src/TreeifyWindow/Internal/State'
import {css} from 'src/TreeifyWindow/View/css'
import {CommonDialogView} from 'src/TreeifyWindow/View/Dialog/CommonDialogView'

export type DefaultWindowModeSettingDialogViewModel = DefaultWindowModeSettingDialog & {
  initialDefaultWindowMode: DefaultWindowMode
  onClickOkButton: () => void
  onClickCancelButton: () => void
}

export function createDefaultWindowModeSettingDialogViewModel(
  state: State
): DefaultWindowModeSettingDialogViewModel | undefined {
  if (state.defaultWindowModeSettingDialog === null) return undefined

  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const targetPageId = CurrentState.isPage(targetItemId)
    ? targetItemId
    : ItemPath.getRootItemId(targetItemPath)

  return {
    ...state.defaultWindowModeSettingDialog,
    initialDefaultWindowMode: state.pages[targetPageId].defaultWindowMode,
    onClickOkButton: () => {
      // デフォルトウィンドウモードを更新
      const select = document.querySelector<HTMLSelectElement>(
        '.default-window-mode-setting-dialog_select'
      )
      assertNonNull(select)
      CurrentState.setDefaultWindowMode(targetPageId, select.value as DefaultWindowMode)

      // タイムスタンプを更新
      CurrentState.updateItemTimestamp(targetPageId)

      // ダイアログを閉じる
      CurrentState.setDefaultWindowModeSettingDialog(null)
      CurrentState.commit()
    },
    onClickCancelButton: () => {
      // ダイアログを閉じる
      CurrentState.setDefaultWindowModeSettingDialog(null)
      CurrentState.commit()
    },
  }
}

export function DefaultWindowModeSettingDialogView(
  viewModel: DefaultWindowModeSettingDialogViewModel
) {
  return CommonDialogView({
    title: 'デフォルトウィンドウモード設定',
    content: html`
      <div class="default-window-mode-setting-dialog_content">
        <select class="default-window-mode-setting-dialog_select" size="5">
          <option value="keep">指定なし</option>
          <option value="dual">デュアルウィンドウモード</option>
          <option value="floating">フローティングウィンドウモード</option>
          <option value="full">フルウィンドウモード</option>
          <option value="inherit">親ページの設定を継承</option>
        </select>
        <div class="default-window-mode-setting-dialog_button-area">
          <button @click=${viewModel.onClickOkButton}>完了</button>
          <button @click=${viewModel.onClickCancelButton}>キャンセル</button>
        </div>
      </div>
    `,
    onCloseDialog: () => {
      // ダイアログを閉じる
      CurrentState.setDefaultWindowModeSettingDialog(null)
      CurrentState.commit()
    },
  })
}

export const DefaultWindowModeSettingDialogCss = css`
  .default-window-mode-setting-dialog_select {
    margin: 1em;
  }

  .default-window-mode-setting-dialog_select option {
    padding-right: 5em;
  }

  .default-window-mode-setting-dialog_button-area {
    /* ボタン群を右寄せにする */
    margin: 1em 1em 1em auto;
    width: max-content;
  }
`
