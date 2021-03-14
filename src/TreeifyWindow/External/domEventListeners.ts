import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {External} from 'src/TreeifyWindow/External/External'

/** グローバルなselectionchangeイベントリスナー */
export function onSelectionChange(event: Event) {
  External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
  NextState.commit()
}
