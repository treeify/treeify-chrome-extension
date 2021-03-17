import {WebPageItemTitleSettingDialog} from 'src/TreeifyWindow/Internal/State'
import {html} from 'lit-html'
import {styleMap} from 'lit-html/directives/style-map'

export type WebPageItemTitleSettingDialogViewModel = WebPageItemTitleSettingDialog

export function WebPageItemTitleSettingDialogView(
  viewModel: WebPageItemTitleSettingDialogViewModel
) {
  const style = styleMap({
    left: `${viewModel.targetItemRect.left}px`,
    top: `${viewModel.targetItemRect.top}px`,
    width: `${viewModel.targetItemRect.width}px`,
    height: `${viewModel.targetItemRect.height}px`,
  })
  return html`
    <div id="web-page-item-title-setting-dialog" style=${style}>
      <input type="text" class="web-page-item-title-setting-dialog_text-box" />
    </div>
  `
}
