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
      title: 'カスタムCSS',
      onClick: () => {
        External.instance.dialogState = {type: 'CustomCssDialog'}
      },
    }
  )
}
