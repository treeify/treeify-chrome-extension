import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {External} from 'src/TreeifyWindow/External/External'

/** グローバルなselectionchangeイベントリスナー */
export function onSelectionChange(event: Event) {
  const textItemSelection = getTextItemSelectionFromDom()
  if (textItemSelection !== undefined) {
    External.instance.requestSelectAfterRendering(textItemSelection)
  }
  NextState.commit()
}
