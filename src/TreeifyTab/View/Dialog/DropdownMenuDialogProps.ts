import {List} from 'immutable'
import {integer} from 'src/Common/integer'
import {DropdownMenuItemProps} from 'src/TreeifyTab/View/Dialog/DropdownMenuItemProps'

export type DropdownMenuDialogProps = {
  top: integer
  right: integer
  itemPropses: List<DropdownMenuItemProps>
}
