import {List} from 'immutable'
import {integer} from 'src/Common/integer'
import {External} from 'src/TreeifyWindow/External/External'
import {ContextMenuDialog} from 'src/TreeifyWindow/Internal/State'
import {
  ContextMenuItemProps,
  createContextMenuItemPropses,
} from 'src/TreeifyWindow/View/Dialog/ContextMenuItemProps'

export type ContextMenuDialogProps = {
  mousePosition: {x: integer; y: integer}
  contextMenuItemPropses: List<ContextMenuItemProps>
}

export function createContextMenuDialogProps(dialog: ContextMenuDialog): ContextMenuDialogProps {
  return {
    // TODO: マウス座標がundefinedの場合はターゲットアイテムのDOMの座標を採用するといいと思う
    mousePosition: External.instance.mousePosition ?? {x: 0, y: 0},
    contextMenuItemPropses: createContextMenuItemPropses(),
  }
}
