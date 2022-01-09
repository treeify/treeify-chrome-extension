import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { currentDragData, ItemDragData } from 'src/TreeifyTab/View/dragAndDrop'
import { assertNonNull, assertNonUndefined } from 'src/Utility/Debug/assert'
import { RArray$ } from 'src/Utility/fp-ts'
import { Coordinate, integer } from 'src/Utility/integer'

export type DragImageProps = {
  initialMousePosition: Coordinate
  itemPath: ItemPath
  calculateDropDestinationStyle(event: MouseEvent, draggedItemPath: ItemPath): string
  onDrop(event: MouseEvent, itemPath: ItemPath): void
}

export function createDragImageProps(): DragImageProps | undefined {
  if (currentDragData?.type !== 'ItemDragData') return undefined

  return {
    initialMousePosition: currentDragData.initialMousePosition,
    itemPath: currentDragData.itemPath,
    calculateDropDestinationStyle,
    onDrop,
  }
}

function calculateDropDestinationStyle(event: MouseEvent, draggedItemPath: ItemPath): string {
  const leftSidebar = document.querySelector('.left-sidebar_root')
  assertNonNull(leftSidebar)
  if (leftSidebar.getBoundingClientRect().right < event.clientX) {
    // 左サイドバーより右の領域の場合

    const parentItemId = ItemPath.getParentItemId(draggedItemPath)
    if (parentItemId === undefined) return ''

    const itemElement = searchMainAreaElementByYCoordinate(event.clientY)
    if (itemElement === undefined) return ''

    const itemPath: ItemPath = JSON.parse(itemElement.dataset.itemPath!)

    const rect = itemElement.getBoundingClientRect()
    if (event.clientX < rect.x) {
      // Rollへのドロップの場合

      const rollDroppedItemPath = searchElementByXCoordinate(itemPath, event.clientX)
      if (rollDroppedItemPath === undefined) return ''

      const rollElement = document
        .getElementById(JSON.stringify(rollDroppedItemPath))
        ?.querySelector('.main-area-roll_root')
      assertNonNull(rollElement)
      assertNonUndefined(rollElement)
      const rollRect = rollElement.getBoundingClientRect()

      if (CurrentState.getDisplayingChildItemIds(rollDroppedItemPath).size > 0) {
        return `
          top: ${rollRect.bottom}px;
          left: ${rollRect.right}px;
          width: ${rect.width}px;
          border: 1px solid var(--drop-destination-color);
        `
      } else {
        return `
          top: ${rollRect.top}px;
          left: ${rollRect.left}px;
          width: ${rollRect.width}px;
          height: ${rollRect.width}px;
          border: 1px solid var(--drop-destination-color);
        `
      }
    } else {
      // Roll以外の場所の場合

      if (
        RArray$.shallowEqual(RArray$.takeLeft(draggedItemPath.length)(itemPath), draggedItemPath)
      ) {
        // 少し分かりづらいが、上記条件を満たすときはドラッグアンドドロップ移動を認めてはならない。
        // 下記の2パターンが該当する。
        // (A) 自分自身へドロップした場合（無意味だしエッジ付け替えの都合で消えてしまうので何もしなくていい）
        // (B) 自分の子孫へドロップした場合（変な循環参照を作る危険な操作なので認めてはならない）
        return ''
      }

      // 要素の上端を0%、下端を100%として、マウスが何%にいるのかを計算する（0~1で表現）
      const ratio = (event.clientY - rect.top) / (rect.bottom - rect.top)
      if (ratio <= 0.5) {
        // 座標が要素の上の方の場合

        // アクティブページのさらに上にはドロップできない
        if (!ItemPath.hasParent(itemPath)) return ''

        return `
          top: ${rect.top}px;
          left: calc(${rect.left}px - var(--main-area-calculated-line-height));
          width: ${rect.width}px;
          border: 1px solid var(--drop-destination-color);
        `
      } else {
        // 座標が要素の下の方の場合

        if (CurrentState.getDisplayingChildItemIds(itemPath).size > 0) {
          return `
            top: ${rect.bottom}px;
            left: ${rect.left}px;
            width: ${rect.width}px;
            border: 1px solid var(--drop-destination-color);
          `
        } else {
          return `
            top: ${rect.bottom}px;
            left: calc(${rect.left}px - var(--main-area-calculated-line-height));
            width: ${rect.width}px;
            border: 1px solid var(--drop-destination-color);
          `
        }
      }
    }
  } else {
    // 左サイドバーにドロップされた場合

    const pageElement = searchLeftSidebarElementByYCoordinate(event.clientY)
    if (pageElement === undefined) return ''

    const rect = pageElement.getBoundingClientRect()
    return `
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 1px solid var(--drop-destination-color);
    `
  }
}

function onDrop(event: MouseEvent, draggedItemPath: ItemPath) {
  const leftSidebar = document.querySelector('.left-sidebar_root')
  assertNonNull(leftSidebar)
  if (leftSidebar.getBoundingClientRect().right < event.clientX) {
    // 左サイドバーより右の領域にドロップされた場合

    onDropIntoMainArea(event, draggedItemPath)
  } else {
    // 左サイドバーにドロップされた場合

    onDropIntoLeftSidebar(event, draggedItemPath)
  }
}

function onDropIntoMainArea(event: MouseEvent, draggedItemPath: ItemPath) {
  // エッジの付け替えを行うので、エッジが定義されない場合は何もしない
  const parentItemId = ItemPath.getParentItemId(draggedItemPath)
  if (parentItemId === undefined) return

  const itemElement = searchMainAreaElementByYCoordinate(event.clientY)
  if (itemElement === undefined) return

  const itemPath: ItemPath = JSON.parse(itemElement.dataset.itemPath!)

  const rect = itemElement.getBoundingClientRect()
  if (event.clientX < rect.x) {
    // Rollへのドロップの場合

    // どの項目のRollにドロップしたかを探索する
    const rollDroppedItemPath = searchElementByXCoordinate(itemPath, event.clientX)
    if (rollDroppedItemPath === undefined) return

    const rollDroppedItemId = ItemPath.getItemId(rollDroppedItemPath)
    const draggedItemId = ItemPath.getItemId(draggedItemPath)
    const isPageOrFolded =
      CurrentState.isPage(rollDroppedItemId) || CurrentState.getIsFolded(rollDroppedItemPath)

    if (
      RArray$.shallowEqual(
        RArray$.takeLeft(draggedItemPath.length)(rollDroppedItemPath),
        draggedItemPath
      )
    ) {
      // 少し分かりづらいが、上記条件を満たすときはドラッグアンドドロップ移動を認めてはならない。
      // 下記の2パターンが該当する。
      // (A) 自分自身へドロップした場合（無意味だしエッジ付け替えの都合で消えてしまうので何もしなくていい）
      // (B) 自分の子孫へドロップした場合（変な循環参照を作る危険な操作なので認めてはならない）
      return
    }

    Internal.instance.saveCurrentStateToUndoStack()

    // エッジを付け替える
    const edge = CurrentState.removeItemGraphEdge(parentItemId, draggedItemId)
    if (isPageOrFolded) {
      CurrentState.insertFirstChildItem(rollDroppedItemId, draggedItemId, edge)
      CurrentState.setTargetItemPath(rollDroppedItemPath)
    } else {
      CurrentState.insertLastChildItem(rollDroppedItemId, draggedItemId, edge)
      CurrentState.setTargetItemPath(RArray$.append(draggedItemId)(rollDroppedItemPath))
    }

    CurrentState.updateItemTimestamp(draggedItemId)
    Rerenderer.instance.rerender()
  } else {
    // Roll以外の場所へのドロップの場合

    if (RArray$.shallowEqual(RArray$.takeLeft(draggedItemPath.length)(itemPath), draggedItemPath)) {
      // 少し分かりづらいが、上記条件を満たすときはドラッグアンドドロップ移動を認めてはならない。
      // 下記の2パターンが該当する。
      // (A) 自分自身へドロップした場合（無意味だしエッジ付け替えの都合で消えてしまうので何もしなくていい）
      // (B) 自分の子孫へドロップした場合（変な循環参照を作る危険な操作なので認めてはならない）
      return
    }

    const draggedItemId = ItemPath.getItemId(draggedItemPath)

    // ドロップ先要素の上端を0%、下端を100%として、マウスが何%にいるのかを計算する（0~1で表現）
    const ratio = (event.clientY - rect.top) / (rect.bottom - rect.top)
    if (ratio <= 0.5) {
      // ドロップ先座標がドロップ先要素の上の方の場合

      // ドロップ先がアクティブページなら何もしない
      if (!ItemPath.hasParent(itemPath)) return

      Internal.instance.saveCurrentStateToUndoStack()

      // エッジを付け替える
      const edge = CurrentState.removeItemGraphEdge(parentItemId, draggedItemId)
      const newItemPath = CurrentState.insertPrevSiblingItem(itemPath, draggedItemId, edge)
      CurrentState.setTargetItemPath(newItemPath)
    } else {
      // ドロップ先座標がドロップ先要素の下の方の場合

      Internal.instance.saveCurrentStateToUndoStack()

      // エッジを付け替える
      const edge = CurrentState.removeItemGraphEdge(parentItemId, draggedItemId)
      const newItemPath = CurrentState.insertBelowItem(itemPath, draggedItemId, edge)
      CurrentState.setTargetItemPath(newItemPath)
    }

    CurrentState.updateItemTimestamp(draggedItemId)
    Rerenderer.instance.rerender()
  }
}

// メインエリア内で指定されたY座標に表示されている項目のコンテンツエリアのDOM要素を返す
function searchMainAreaElementByYCoordinate(y: integer): HTMLElement | undefined {
  // メインエリア内の全項目をリスト化し、Y座標でソート
  const elements = document.querySelectorAll<HTMLElement>('.main-area-node_content-area')
  const sortedElements = RArray$.sortByNumber((element: HTMLElement) => {
    return element.getBoundingClientRect().bottom
  })(Array.from(elements))

  for (const element of RArray$.reverse(sortedElements)) {
    const rect = element.getBoundingClientRect()
    if (rect.top <= y) {
      return element
    }
  }
  return undefined
}

// ItemPathの親を辿り、指定されたX座標にRollを表示しているItemPathを探索する
function searchElementByXCoordinate(itemPath: ItemPath, x: integer): ItemPath | undefined {
  if (itemPath.length === 0) return undefined

  const element = document.getElementById(JSON.stringify(itemPath))
  if (element === null) return undefined

  if (element.getBoundingClientRect().x < x) {
    return itemPath
  }

  return searchElementByXCoordinate(RArray$.pop(itemPath), x)
}

function onDropIntoLeftSidebar(event: MouseEvent, draggedItemPath: ItemPath) {
  const element = searchLeftSidebarElementByYCoordinate(event.clientY)
  if (element === undefined) return

  assertNonUndefined(element.dataset.itemId)
  const itemId = parseInt(element.dataset.itemId)

  const draggedItemId = ItemPath.getItemId(draggedItemPath)

  // TODO: 循環チェックをしないと親子間でのドロップとかで壊れるぞ
  // エッジの付け替えを行うので、エッジが定義されない場合は何もしない
  if (ItemPath.getParentItemId(draggedItemPath) === undefined) return

  Internal.instance.saveCurrentStateToUndoStack()

  // targetItemPathが実在しなくなるので退避
  const aboveItemPath = CurrentState.findAboveItemPath(draggedItemPath)
  assertNonUndefined(aboveItemPath)
  CurrentState.setTargetItemPath(aboveItemPath)

  // エッジを付け替える
  const edge = CurrentState.removeItemGraphEdge(
    ItemPath.getParentItemId(draggedItemPath)!,
    draggedItemId
  )
  CurrentState.insertFirstChildItem(itemId, draggedItemId, edge)
  const newTargetItemPath = [itemId, draggedItemId]
  Internal.instance.mutate(newTargetItemPath, PropertyPath.of('pages', itemId, 'targetItemPath'))
  Internal.instance.mutate(newTargetItemPath, PropertyPath.of('pages', itemId, 'anchorItemPath'))

  CurrentState.updateItemTimestamp(draggedItemId)
  Rerenderer.instance.rerender()
}

// 左サイドバー内で指定されたY座標に表示されている項目のコンテンツエリアのDOM要素を返す
function searchLeftSidebarElementByYCoordinate(y: integer): HTMLElement | undefined {
  // メインエリア内の全項目をリスト化し、Y座標でソート
  const elements = document.querySelectorAll<HTMLElement>('.page-tree-node_content-area')
  const sortedElements = RArray$.sortByNumber((element: HTMLElement) => {
    return element.getBoundingClientRect().bottom
  })(Array.from(elements))

  for (const element of sortedElements) {
    const rect = element.getBoundingClientRect()
    if (y <= rect.bottom) {
      return element
    }
  }
  return undefined
}
