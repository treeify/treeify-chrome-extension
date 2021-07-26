import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {External} from 'src/TreeifyTab/External/External'
import {Command} from 'src/TreeifyTab/Internal/Command'
import {DropdownMenuDialogProps} from 'src/TreeifyTab/View/Dialog/DropdownMenuDialogProps'

export function createPreferenceDropdownMenuDialogProps(): DropdownMenuDialogProps {
  const preferenceButton = document.querySelector('.preference-button_icon')?.parentElement
  const rect = preferenceButton?.getBoundingClientRect()
  assertNonUndefined(rect)

  return {
    top: rect.bottom,
    right: rect.right,
    itemPropses: List.of(
      {
        title: 'ワークスペース',
        onClick: () => Command.showWorkspaceDialog(),
      },
      {
        title: 'キーボード操作設定',
        onClick: () => {
          External.instance.dialogState = {type: 'KeyBindingDialog'}
        },
      },
      {
        title: 'カスタムCSS',
        onClick: () => {
          External.instance.dialogState = {type: 'CustomCssDialog'}
        },
      }
    ),
  }
}
