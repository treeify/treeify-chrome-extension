import {List} from 'immutable'
import {Coordinate} from 'src/Common/integer'
import {ContextMenuDialog} from 'src/TreeifyTab/Internal/State'
import {
  ContextMenuItemProps,
  createContextMenuItemPropses,
} from 'src/TreeifyTab/View/Dialog/ContextMenuItemProps'

export type ContextMenuDialogProps = {
  mousePosition: Coordinate
  contextMenuItemPropses: List<ContextMenuItemProps>
}

export function createContextMenuDialogProps(dialog: ContextMenuDialog): ContextMenuDialogProps {
  return {
    // TODO: マウス座標がundefinedの場合はターゲットアイテムのDOMの座標を採用するといいと思う
    mousePosition: dialog.mousePosition,
    contextMenuItemPropses: createContextMenuItemPropses(),
  }
}
