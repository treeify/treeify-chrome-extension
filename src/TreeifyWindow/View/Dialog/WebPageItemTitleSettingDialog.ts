import {WebPageItemTitleSettingDialog} from 'src/TreeifyWindow/Internal/State'
import {html} from 'lit-html'

export type WebPageItemTitleSettingDialogViewModel = WebPageItemTitleSettingDialog

export function WebPageItemTitleSettingDialogView(
  viewMode: WebPageItemTitleSettingDialogViewModel
) {
  return html`
    <div id="web-page-item-title-setting-dialog">
      <input type="text" />
    </div>
  `
}
