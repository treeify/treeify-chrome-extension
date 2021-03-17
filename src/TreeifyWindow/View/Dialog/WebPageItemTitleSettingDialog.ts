import {State, WebPageItemTitleSettingDialog} from 'src/TreeifyWindow/Internal/State'
import {styleMap} from 'lit-html/directives/style-map'
import {html} from 'lit-html'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {doWithErrorHandling} from 'src/Common/Debug/report'

export type WebPageItemTitleSettingDialogViewModel = {
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialog
  onKeyDown: (event: KeyboardEvent) => void
}

export function createWebPageItemTitleSettingDialogViewModel(
  state: State
): WebPageItemTitleSettingDialogViewModel | undefined {
  if (state.webPageItemTitleSettingDialog === null) return undefined

  const targetItemPath = state.pages[state.activePageId].targetItemPath

  return {
    webPageItemTitleSettingDialog: state.webPageItemTitleSettingDialog,
    onKeyDown: (event) => {
      doWithErrorHandling(() => {
        if (event.isComposing) return

        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
          if (event.target.value === '') {
            // 入力欄が空の状態でEnterキーを押したらタイトル設定を削除する
            NextState.setWebPageItemTitle(targetItemPath.itemId, null)
          } else {
            NextState.setWebPageItemTitle(targetItemPath.itemId, event.target.value)
          }
          // タイトル設定ダイアログを閉じる
          NextState.setWebPageItemTitleSettingDialog(null)

          // TODO: フォーカスを戻す機能を実装する
          // External.instance.requestFocusAfterRendering()

          NextState.commit()
        }
      })
    },
  }
}

export function WebPageItemTitleSettingDialogView(
  viewModel: WebPageItemTitleSettingDialogViewModel
) {
  const style = styleMap({
    left: `${viewModel.webPageItemTitleSettingDialog.targetItemRect.left}px`,
    top: `${viewModel.webPageItemTitleSettingDialog.targetItemRect.top}px`,
    width: `${viewModel.webPageItemTitleSettingDialog.targetItemRect.width}px`,
    height: `${viewModel.webPageItemTitleSettingDialog.targetItemRect.height}px`,
  })
  return html`
    <div id="web-page-item-title-setting-dialog" style=${style}>
      <input
        type="text"
        class="web-page-item-title-setting-dialog_text-box"
        @keydown=${viewModel.onKeyDown}
      />
    </div>
  `
}
