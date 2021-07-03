import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {Dialog} from 'src/TreeifyTab/Internal/State'

/** ダイアログの状態を設定する */
export function setDialog(value: Dialog | null) {
  Internal.instance.mutate(value, PropertyPath.of('dialog'))
}
