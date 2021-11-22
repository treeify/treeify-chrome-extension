import { List } from 'immutable'
import { DropdownMenuItemProps } from 'src/TreeifyTab/View/Dialog/DropdownMenuItemProps'
import { integer } from 'src/Utility/integer'

export type DropdownMenuDialogProps = {
  top: integer
  right: integer
  itemPropses: List<DropdownMenuItemProps>
}
