import {NextState} from 'src/TreeifyWindow/Internal/NextState/index'
import {PropertyPath} from 'src/TreeifyWindow/Internal/Batchizer'
import {WebPageItemTitleSettingDialog} from 'src/TreeifyWindow/Internal/State'

/** ウェブページアイテムのタイトル設定ダイアログの状態を設定する */
export function setWebPageItemTitleSettingDialog(value: WebPageItemTitleSettingDialog | null) {
  NextState.getBatchizer().postSetMutation(PropertyPath.of('webPageItemTitleSettingDialog'), value)
}
