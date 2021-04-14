import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {CodeBlockEditDialog, WebPageItemTitleSettingDialog} from 'src/TreeifyWindow/Internal/State'

/** ウェブページアイテムのタイトル設定ダイアログの状態を設定する */
export function setWebPageItemTitleSettingDialog(value: WebPageItemTitleSettingDialog | null) {
  Internal.instance.state.webPageItemTitleSettingDialog = value
  Internal.instance.markAsMutated(PropertyPath.of('webPageItemTitleSettingDialog'))
}

/** コードブロックアイテム編集ダイアログの状態を設定する */
export function setCodeBlockEditDialog(value: CodeBlockEditDialog | null) {
  Internal.instance.state.codeBlockEditDialog = value
  Internal.instance.markAsMutated(PropertyPath.of('codeBlockEditDialog'))
}
