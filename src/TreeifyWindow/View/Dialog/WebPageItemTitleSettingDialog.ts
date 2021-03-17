import {State, WebPageItemTitleSettingDialog} from 'src/TreeifyWindow/Internal/State'
import {styleMap} from 'lit-html/directives/style-map'
import {html} from 'lit-html'

export type WebPageItemTitleSettingDialogViewModel = {
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialog
  onKeyDown: (event: KeyboardEvent) => void
}

export function createWebPageItemTitleSettingDialogViewModel(
  state: State
): WebPageItemTitleSettingDialogViewModel | undefined {
  if (state.webPageItemTitleSettingDialog === null) return undefined

  return {
    webPageItemTitleSettingDialog: state.webPageItemTitleSettingDialog,
    onKeyDown: (event) => {
      // TODO:
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
