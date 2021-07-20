import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {
  createPreferenceDropdownMenuItemPropses,
  PreferenceDropdownMenuItemProps,
} from 'src/TreeifyTab/View/Dialog/PreferenceDropdownMenuItemProps'

export type PreferenceDropdownMenuDialogProps = {
  top: integer
  right: integer
  itemPropses: List<PreferenceDropdownMenuItemProps>
}

export function createPreferenceDropdownMenuDialogProps(): PreferenceDropdownMenuDialogProps {
  const preferenceButton = document.querySelector('.preference-button_icon')?.parentElement
  const rect = preferenceButton?.getBoundingClientRect()
  assertNonUndefined(rect)

  return {
    top: rect.bottom,
    right: rect.right,
    itemPropses: createPreferenceDropdownMenuItemPropses(),
  }
}
