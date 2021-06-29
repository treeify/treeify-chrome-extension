import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {Dialog} from 'src/TreeifyWindow/Internal/State'

/** ダイアログの状態を設定する */
export function setDialog(value: Dialog | null) {
  Internal.instance.mutate(value, PropertyPath.of('dialog'))
}
