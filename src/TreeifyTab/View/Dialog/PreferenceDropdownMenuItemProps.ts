import {List} from 'immutable'
import {External} from 'src/TreeifyTab/External/External'
import {NullaryCommand} from 'src/TreeifyTab/Internal/NullaryCommand'

export type PreferenceDropdownMenuItemProps = {
  title: string
  onClick: () => void
}

export function createPreferenceDropdownMenuItemPropses(): List<PreferenceDropdownMenuItemProps> {
  return List.of(
    {
      title: 'ワークスペース',
      onClick: () => NullaryCommand.showWorkspaceDialog(),
    },
    {
      title: 'カスタムCSS',
      onClick: () => {
        External.instance.dialogState = {type: 'CustomCssDialog'}
      },
    }
  )
}
