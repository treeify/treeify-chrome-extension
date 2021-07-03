import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {DefaultWindowMode, DefaultWindowModeSettingDialog} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export type DefaultWindowModeSettingDialogProps = DefaultWindowModeSettingDialog & {
  initialDefaultWindowMode: DefaultWindowMode
  onClickCancelButton: () => void
}

export function createDefaultWindowModeSettingDialogProps(
  dialog: DefaultWindowModeSettingDialog
): DefaultWindowModeSettingDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const targetPageId = CurrentState.isPage(targetItemId)
    ? targetItemId
    : ItemPath.getRootItemId(targetItemPath)

  return {
    ...dialog,
    initialDefaultWindowMode: Internal.instance.state.pages[targetPageId].defaultWindowMode,
    onClickCancelButton: () => {
      // ダイアログを閉じる
      CurrentState.setDialog(null)
      Rerenderer.instance.rerender()
    },
  }
}
