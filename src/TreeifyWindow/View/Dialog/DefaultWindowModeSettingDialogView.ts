import {assertNonNull} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {
  DefaultWindowMode,
  DefaultWindowModeSettingDialog,
  State,
} from 'src/TreeifyWindow/Internal/State'

export type DefaultWindowModeSettingDialogViewModel = DefaultWindowModeSettingDialog & {
  initialDefaultWindowMode: DefaultWindowMode
  onClickFinishButton: () => void
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
    onClickFinishButton: () => {
      // デフォルトウィンドウモードを更新
      const form = document.querySelector<HTMLFormElement>(
        '.default-window-mode-setting-dialog_option-list'
      )
      assertNonNull(form)
      const selectedDefaultWindowMode = form.defaultWindowMode.value as DefaultWindowMode
      CurrentState.setDefaultWindowMode(targetPageId, selectedDefaultWindowMode)

      // タイムスタンプを更新
      CurrentState.updateItemTimestamp(targetPageId)

      // ダイアログを閉じる
      CurrentState.setDefaultWindowModeSettingDialog(null)
      CurrentState.commit()
    },
    onClickCancelButton: () => {
      // ダイアログを閉じる
      CurrentState.setDefaultWindowModeSettingDialog(null)
      CurrentState.commit()
    },
  }
}
