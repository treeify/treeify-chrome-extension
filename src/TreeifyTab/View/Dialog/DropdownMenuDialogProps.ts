import { DropdownMenuItemProps } from 'src/TreeifyTab/View/Dialog/DropdownMenuItemProps'
import { RArray } from 'src/Utility/fp-ts'
import { integer } from 'src/Utility/integer'

export type DropdownMenuDialogProps = {
  top: integer
  right: integer
  itemPropses: RArray<DropdownMenuItemProps>
}
