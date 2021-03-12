import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'

/** グローバルなselectionchangeイベントリスナー */
export function onSelectionChange(event: Event) {
  NextState.setItemTreeTextItemSelection(getTextItemSelectionFromDom() ?? null)
  NextState.commit()
}
