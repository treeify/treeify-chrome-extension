import {PropertyPath} from 'src/TreeifyWindow/Internal/Batchizer'
import {WebPageItemTitleSettingDialog} from 'src/TreeifyWindow/Internal/State'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'

/** ウェブページアイテムのタイトル設定ダイアログの状態を設定する */
export function setWebPageItemTitleSettingDialog(value: WebPageItemTitleSettingDialog | null) {
  Internal.instance.state.webPageItemTitleSettingDialog = value
  Internal.instance.mutatedPropertyPaths.add(PropertyPath.of('webPageItemTitleSettingDialog'))
}
