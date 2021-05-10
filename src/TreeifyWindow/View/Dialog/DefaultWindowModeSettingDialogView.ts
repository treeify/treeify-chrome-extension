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
  onClickFinishButton: () => void
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
    onClickFinishButton: () => {
      // デフォルトウィンドウモードを更新
      const form = document.querySelector<HTMLFormElement>(
        '.default-window-mode-setting-dialog_option-list'
      )
      assertNonNull(form)
      const selectedDefaultWindowMode = form.defaultWindowMode.value as DefaultWindowMode
      CurrentState.setDefaultWindowMode(targetPageId, selectedDefaultWindowMode)

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
        <form class="default-window-mode-setting-dialog_option-list">
          ${createOption('keep', '指定なし', viewModel.initialDefaultWindowMode)}
          ${createOption('dual', 'デュアルウィンドウモード', viewModel.initialDefaultWindowMode)}
          ${createOption(
            'floating',
            'フローティングウィンドウモード',
            viewModel.initialDefaultWindowMode
          )}
          ${createOption('full', 'フルウィンドウモード', viewModel.initialDefaultWindowMode)}
          ${createOption('inherit', '親ページの設定を継承', viewModel.initialDefaultWindowMode)}
        </form>
        <div class="default-window-mode-setting-dialog_button-area">
          <button @click=${viewModel.onClickFinishButton}>完了</button>
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

function createOption(value: string, text: string, initialDefaultWindowMode: DefaultWindowMode) {
  if (initialDefaultWindowMode === value) {
    return html`<div class="default-window-mode-setting-dialog_option">
      <input type="radio" name="defaultWindowMode" value=${value} checked />${text}
    </div>`
  } else {
    return html`<div class="default-window-mode-setting-dialog_option">
      <input type="radio" name="defaultWindowMode" value=${value} />
      <div>${text}</div>
    </div>`
  }
}

export const DefaultWindowModeSettingDialogCss = css`
  .default-window-mode-setting-dialog_option-list {
    margin: 1em;
  }

  input[type='radio'][name='defaultWindowMode'] {
    margin: 0 3px 0 0;
  }

  /* デフォルトウィンドウモードの選択肢 */
  .default-window-mode-setting-dialog_option {
    display: flex;
    align-items: center;

    margin-top: 0.1em;

    font-size: 14px;
  }
  .default-window-mode-setting-dialog_option:first-child {
    margin-top: 0;
  }

  .default-window-mode-setting-dialog_button-area {
    /* ボタン群を右寄せにする */
    margin: 1em 1em 1em auto;
    width: max-content;
  }
`
