import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {
  CodeBlockItemEditDialog,
  WebPageItemTitleSettingDialog,
} from 'src/TreeifyWindow/Internal/State'

/** ウェブページアイテムのタイトル設定ダイアログの状態を設定する */
export function setWebPageItemTitleSettingDialog(value: WebPageItemTitleSettingDialog | null) {
  Internal.instance.state.webPageItemTitleSettingDialog = value
  Internal.instance.markAsMutated(PropertyPath.of('webPageItemTitleSettingDialog'))
}

/** コードブロックアイテム編集ダイアログの状態を設定する */
export function setCodeBlockItemEditDialog(value: CodeBlockItemEditDialog | null) {
  Internal.instance.state.codeBlockItemEditDialog = value
  Internal.instance.markAsMutated(PropertyPath.of('codeBlockItemEditDialog'))
}
