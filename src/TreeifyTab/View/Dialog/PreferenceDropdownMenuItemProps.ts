import {List} from 'immutable'
import {External} from 'src/TreeifyTab/External/External'
import {Command} from 'src/TreeifyTab/Internal/Command'

export type PreferenceDropdownMenuItemProps = {
  title: string
  onClick: () => void
}

export function createPreferenceDropdownMenuItemPropses(): List<PreferenceDropdownMenuItemProps> {
  return List.of(
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
  )
}
