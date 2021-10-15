import {is, List} from 'immutable'
import {assertNonNull, assertNonUndefined} from 'src/Common/Debug/assert'
import {Coordinate, integer} from 'src/Common/integer'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
import {currentDragData, ItemDragData} from 'src/TreeifyTab/View/dragAndDrop'

export type DragImageProps = {
  initialMousePosition: Coordinate
  itemPath: ItemPath
  calculateLinePosition: (
    event: MouseEvent,
    draggedItemPath: ItemPath
  ) => DragLinePosition | undefined
  onDrop: (event: MouseEvent, itemPath: ItemPath) => void
}

export type DragLinePosition = {
  top: integer
  left: integer
  width: integer
}

export function createDragImageProps(): DragImageProps | undefined {
  if (currentDragData?.type !== 'ItemDragData') return undefined

  return {
    initialMousePosition: currentDragData.initialMousePosition,
    itemPath: currentDragData.itemPath,
    calculateLinePosition,
    onDrop,
  }
}

function calculateLinePosition(
  event: MouseEvent,
  draggedItemPath: ItemPath
): DragLinePosition | undefined {
  const parentItemId = ItemPath.getParentItemId(draggedItemPath)
  if (parentItemId === undefined) return undefined

  const itemElement = searchMainAreaElementByYCoordinate(event.clientY)
  if (itemElement === undefined) return undefined

  const itemPath: ItemPath = List(JSON.parse(itemElement.dataset.itemPath!))

  const rect = itemElement.getBoundingClientRect()
  if (event.clientX < rect.x) {
    // Rollへのドロップの場合

    return undefined
  } else {
    // Roll以外の場所へのドロップの場合

    if (is(itemPath.take(draggedItemPath.size), draggedItemPath)) {
      // 少し分かりづらいが、上記条件を満たすときはドラッグアンドドロップ移動を認めてはならない。
      // 下記の2パターンが該当する。
      // (A) 自分自身へドロップした場合（無意味だしエッジ付け替えの都合で消えてしまうので何もしなくていい）
      // (B) 自分の子孫へドロップした場合（変な循環参照を作る危険な操作なので認めてはならない）
      return undefined
    }

    // 要素の上端を0%、下端を100%として、マウスが何%にいるのかを計算する（0~1で表現）
    const ratio = (event.clientY - rect.top) / (rect.bottom - rect.top)
    if (ratio <= 0.5) {
      // 座標が要素の上の方の場合

      // アクティブページのさらに上にはドロップできない
      if (!ItemPath.hasParent(itemPath)) return undefined

      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
      }
    } else {
      // 座標が要素の下の方の場合

      return {
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      }
    }
  }
}

function onDrop(event: MouseEvent, draggedItemPath: ItemPath) {
  doWithErrorCapture(() => {
    const leftSidebar = document.querySelector('.left-sidebar')
    assertNonNull(leftSidebar)
    if (leftSidebar.getBoundingClientRect().right < event.clientX) {
      // 左サイドバーより右の領域にドロップされた場合

      onDropIntoMainArea(event, draggedItemPath)
    } else {
      // 左サイドバーにドロップされた場合

      onDropIntoLeftSidebar(event, draggedItemPath)
    }
  })
}

function onDropIntoMainArea(event: MouseEvent, draggedItemPath: ItemPath) {
  // エッジの付け替えを行うので、エッジが定義されない場合は何もしない
  const parentItemId = ItemPath.getParentItemId(draggedItemPath)
  if (parentItemId === undefined) return

  const itemElement = searchMainAreaElementByYCoordinate(event.clientY)
  if (itemElement === undefined) return

  const itemPath: ItemPath = List(JSON.parse(itemElement.dataset.itemPath!))

  const rect = itemElement.getBoundingClientRect()
  if (event.clientX < rect.x) {
    // Rollへのドロップの場合

    // どの項目のRollにドロップしたかを探索する
    const rollDroppedItemPath = searchElementByXCoordinate(itemPath, event.clientX)

    const rollDroppedItemId = ItemPath.getItemId(rollDroppedItemPath)
    const draggedItemId = ItemPath.getItemId(draggedItemPath)
    const isPageOrCollapsed =
      CurrentState.isPage(rollDroppedItemId) || CurrentState.getIsCollapsed(rollDroppedItemPath)

    if (is(rollDroppedItemPath.take(draggedItemPath.size), draggedItemPath)) {
      // 少し分かりづらいが、上記条件を満たすときはドラッグアンドドロップ移動を認めてはならない。
      // 下記の2パターンが該当する。
      // (A) 自分自身へドロップした場合（無意味だしエッジ付け替えの都合で消えてしまうので何もしなくていい）
      // (B) 自分の子孫へドロップした場合（変な循環参照を作る危険な操作なので認めてはならない）
      return
    }

    Internal.instance.saveCurrentStateToUndoStack()

    if (event.altKey) {
      if (!CurrentState.isSibling(rollDroppedItemPath, draggedItemPath)) {
        // エッジを追加する（トランスクルード）
        if (isPageOrCollapsed) {
          CurrentState.insertFirstChildItem(rollDroppedItemId, draggedItemId)
        } else {
          CurrentState.insertLastChildItem(rollDroppedItemId, draggedItemId)
        }
      }
    } else {
      // エッジを付け替える
      const edge = CurrentState.removeItemGraphEdge(parentItemId, draggedItemId)
      if (isPageOrCollapsed) {
        CurrentState.insertFirstChildItem(rollDroppedItemId, draggedItemId, edge)
        CurrentState.setTargetItemPath(rollDroppedItemPath)
      } else {
        CurrentState.insertLastChildItem(rollDroppedItemId, draggedItemId, edge)
        CurrentState.setTargetItemPath(rollDroppedItemPath.push(draggedItemId))
      }
    }

    CurrentState.updateItemTimestamp(draggedItemId)
    Rerenderer.instance.rerender()
  } else {
    // Roll以外の場所へのドロップの場合

    if (is(itemPath.take(draggedItemPath.size), draggedItemPath)) {
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

      if (event.altKey) {
        if (!CurrentState.isSibling(itemPath, draggedItemPath)) {
          // エッジを追加する（トランスクルード）
          const newItemPath = CurrentState.insertPrevSiblingItem(itemPath, draggedItemId)
          CurrentState.setTargetItemPath(newItemPath)
        }
      } else {
        // エッジを付け替える
        const edge = CurrentState.removeItemGraphEdge(parentItemId, draggedItemId)
        const newItemPath = CurrentState.insertPrevSiblingItem(itemPath, draggedItemId, edge)
        CurrentState.setTargetItemPath(newItemPath)
      }
    } else {
      // ドロップ先座標がドロップ先要素の下の方の場合

      Internal.instance.saveCurrentStateToUndoStack()

      if (event.altKey) {
        if (!CurrentState.isSibling(itemPath, draggedItemPath)) {
          // エッジを追加する（トランスクルード）
          const newItemPath = CurrentState.insertBelowItem(itemPath, draggedItemId)
          CurrentState.setTargetItemPath(newItemPath)
        }
      } else {
        // エッジを付け替える
        const edge = CurrentState.removeItemGraphEdge(parentItemId, draggedItemId)
        const newItemPath = CurrentState.insertBelowItem(itemPath, draggedItemId, edge)
        CurrentState.setTargetItemPath(newItemPath)
      }
    }

    CurrentState.updateItemTimestamp(draggedItemId)
    Rerenderer.instance.rerender()
  }
}

// メインエリア内で指定されたY座標に表示されている項目のコンテンツエリアのDOM要素を返す
function searchMainAreaElementByYCoordinate(y: integer): HTMLElement | undefined {
  // メインエリア内の全項目をリスト化し、Y座標でソート
  const elements = document.getElementsByClassName('main-area-node_content-area')
  const sortedElements = List(elements).sortBy((element) => {
    return element.getBoundingClientRect().bottom
  }) as List<HTMLElement>

  for (const element of sortedElements.reverse()) {
    const rect = element.getBoundingClientRect()
    if (rect.top <= y) {
      return element
    }
  }
  return undefined
}

// ItemPathの親を辿り、指定されたX座標にRollを表示しているItemPathを探索する
function searchElementByXCoordinate(itemPath: ItemPath, x: integer): ItemPath {
  console.assert(!itemPath.isEmpty())

  const element = document.getElementById(JSON.stringify(itemPath))
  assertNonNull(element)
  if (element.getBoundingClientRect().x < x) {
    return itemPath
  }

  return searchElementByXCoordinate(itemPath.pop(), x)
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

  if (event.altKey) {
    // エッジを追加する（トランスクルード）
    // TODO: エッジを追加していいかどうか整合性チェック
    CurrentState.insertFirstChildItem(itemId, draggedItemId)
  } else {
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
  }

  CurrentState.updateItemTimestamp(draggedItemId)
  Rerenderer.instance.rerender()
}

// 左サイドバー内で指定されたY座標に表示されている項目のコンテンツエリアのDOM要素を返す
function searchLeftSidebarElementByYCoordinate(y: integer): HTMLElement | undefined {
  // メインエリア内の全項目をリスト化し、Y座標でソート
  const elements = document.getElementsByClassName('page-tree-node_content-area')
  const sortedElements = List(elements).sortBy((element) => {
    return element.getBoundingClientRect().bottom
  }) as List<HTMLElement>

  for (const element of sortedElements) {
    const rect = element.getBoundingClientRect()
    if (y <= rect.bottom) {
      return element
    }
  }
  return undefined
}
