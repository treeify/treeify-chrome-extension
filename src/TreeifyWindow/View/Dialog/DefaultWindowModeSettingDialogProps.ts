import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {
  DefaultWindowMode,
  DefaultWindowModeSettingDialog,
  State,
} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

export type DefaultWindowModeSettingDialogProps = DefaultWindowModeSettingDialog & {
  initialDefaultWindowMode: DefaultWindowMode
  onClickCancelButton: () => void
}

export function createDefaultWindowModeSettingDialogProps(
  state: State
): DefaultWindowModeSettingDialogProps | undefined {
  if (state.dialog?.type !== 'DefaultWindowModeSettingDialog') return undefined

  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const targetPageId = CurrentState.isPage(targetItemId)
    ? targetItemId
    : ItemPath.getRootItemId(targetItemPath)

  return {
    ...state.dialog,
    initialDefaultWindowMode: state.pages[targetPageId].defaultWindowMode,
    onClickCancelButton: () => {
      // ダイアログを閉じる
      CurrentState.setDefaultWindowModeSettingDialog(null)
      Rerenderer.instance.rerender()
    },
  }
}
