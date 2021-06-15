import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {
  DefaultWindowMode,
  DefaultWindowModeSettingDialog,
  State,
} from 'src/TreeifyWindow/Internal/State'

export type DefaultWindowModeSettingDialogViewModel = DefaultWindowModeSettingDialog & {
  initialDefaultWindowMode: DefaultWindowMode
  onClickCancelButton: () => void
}

export function createDefaultWindowModeSettingDialogViewModel(
  state: State
): DefaultWindowModeSettingDialogViewModel | undefined {
  if (state.defaultWindowModeSettingDialog === null) return undefined

  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const targetPageId = CurrentState.isPage(targetItemId)
    ? targetItemId
    : ItemPath.getRootItemId(targetItemPath)

  return {
    ...state.defaultWindowModeSettingDialog,
    initialDefaultWindowMode: state.pages[targetPageId].defaultWindowMode,
    onClickCancelButton: () => {
      // ダイアログを閉じる
      CurrentState.setDefaultWindowModeSettingDialog(null)
      CurrentState.commit()
    },
  }
}
