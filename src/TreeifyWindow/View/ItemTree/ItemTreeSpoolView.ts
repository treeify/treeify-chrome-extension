import {integer} from 'src/Common/integer'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {State} from 'src/TreeifyWindow/Internal/State'
import {createDivElement} from 'src/TreeifyWindow/View/createElement'

export type ItemTreeSpoolViewModel = {
  bulletState: ItemTreeBulletState
  /**
   * expand時に表示されるアイテム数。
   * collapsed状態以外の場合は常に0。
   */
  hiddenItemsCount: integer
  onClick: (event: MouseEvent) => void
}

export enum ItemTreeBulletState {
  NO_CHILDREN,
  EXPANDED,
  COLLAPSED,
  PAGE,
}

export function createItemTreeSpoolViewModel(
  state: State,
  itemPath: ItemPath
): ItemTreeSpoolViewModel {
  const bulletState = deriveBulletState(state, itemPath)

  const onClick = (event: MouseEvent) => {
    doWithErrorCapture(() => {
      CurrentState.setTargetItemPath(itemPath)

      const inputId = InputId.fromMouseEvent(event)
      switch (bulletState) {
        case ItemTreeBulletState.NO_CHILDREN:
          switch (inputId) {
            case '1000MouseButton0':
              NullaryCommand.turnIntoAndShowPage()
              break
          }
          break
        case ItemTreeBulletState.EXPANDED:
          switch (inputId) {
            case '0000MouseButton0':
              NullaryCommand.toggleCollapsed()
              break
            case '1000MouseButton0':
              NullaryCommand.turnIntoAndShowPage()
              break
          }
          break
        case ItemTreeBulletState.COLLAPSED:
          switch (inputId) {
            case '0000MouseButton0':
              NullaryCommand.toggleCollapsed()
              break
            case '1000MouseButton0':
              NullaryCommand.turnIntoAndShowPage()
              break
          }
          break
        case ItemTreeBulletState.PAGE:
          switch (inputId) {
            case '0000MouseButton0':
              NullaryCommand.showPage()
              break
            case '1000MouseButton0':
              NullaryCommand.turnIntoNonPageAndExpand()
              CurrentState.commit()
          }
          break
      }
      CurrentState.commit()
    })
  }

  return {bulletState, hiddenItemsCount: countHiddenItems(state, itemPath), onClick}
}

function countHiddenItems(state: State, itemPath: ItemPath): integer {
  const bulletState = deriveBulletState(state, itemPath)
  if (bulletState !== ItemTreeBulletState.COLLAPSED) return 0

  const counts = state.items[ItemPath.getItemId(itemPath)].childItemIds.map((childItemId) => {
    return CurrentState.getDisplayingChildItemIds(itemPath.push(childItemId)).size
  })
  return counts.size + counts.reduce((a: integer, x) => a + x, 0)
}

export function deriveBulletState(state: State, itemPath: ItemPath): ItemTreeBulletState {
  const itemId = ItemPath.getItemId(itemPath)
  if (state.pages[itemId] !== undefined) {
    return ItemTreeBulletState.PAGE
  } else if (state.items[itemId].childItemIds.size === 0) {
    return ItemTreeBulletState.NO_CHILDREN
  } else {
    CurrentState.getIsCollapsed(itemPath)
    return CurrentState.getIsCollapsed(itemPath)
      ? ItemTreeBulletState.COLLAPSED
      : ItemTreeBulletState.EXPANDED
  }
}

/** アイテムツリーのバレットとインデント */
export function ItemTreeSpoolView(viewModel: ItemTreeSpoolViewModel) {
  // TODO: ↓ハードコーディングが激しい。できればユーザーがバレットのサイズを設定できるようにしたい
  const limitedHiddenItemsCount = Math.min(viewModel.hiddenItemsCount, 10)
  const outerCircleRadiusEm = 1.1 + limitedHiddenItemsCount * 0.025
  const outerCircleStyle = `
    width: ${outerCircleRadiusEm}em;
    height: ${outerCircleRadiusEm}em;
  `

  return createDivElement('item-tree-spool', {click: viewModel.onClick}, [
    viewModel.bulletState === ItemTreeBulletState.EXPANDED
      ? createDivElement('item-tree-spool_indent-area', {}, [
          createDivElement('item-tree-spool_indent-line'),
        ])
      : undefined,
    createDivElement(
      'item-tree-spool_bullet-area',
      {},
      viewModel.bulletState === ItemTreeBulletState.PAGE
        ? [createDivElement('item-tree-spool_page-icon')]
        : viewModel.bulletState === ItemTreeBulletState.COLLAPSED
        ? [
            createDivElement({class: 'item-tree-spool_outer-circle', style: outerCircleStyle}, {}),
            createDivElement('item-tree-spool_inner-circle'),
          ]
        : [createDivElement('item-tree-spool_inner-circle')]
    ),
  ])
}
