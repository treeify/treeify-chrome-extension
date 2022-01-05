import { DropdownMenuItemProps } from 'src/TreeifyTab/View/Dialog/DropdownMenuItemProps'
import { Rist } from 'src/Utility/array'
import { integer } from 'src/Utility/integer'

export type DropdownMenuDialogProps = {
  top: integer
  right: integer
  itemPropses: Rist<DropdownMenuItemProps>
}
