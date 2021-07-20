import {List} from 'immutable'
import {NullaryCommand} from 'src/TreeifyTab/Internal/NullaryCommand'

export type PreferenceDropdownMenuItemProps = {
  title: string
  onClick: () => void
}

export function createPreferenceDropdownMenuItemPropses(): List<PreferenceDropdownMenuItemProps> {
  return List.of({
    title: 'ワークスペース',
    onClick: () => NullaryCommand.showWorkspaceDialog(),
  })
}
