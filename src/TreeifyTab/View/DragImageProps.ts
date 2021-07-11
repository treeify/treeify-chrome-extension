import {is, List} from 'immutable'
import {assertNonNull, assertNonUndefined} from 'src/Common/Debug/assert'
import {Coordinate, integer} from 'src/Common/integer'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
import {itemDragData, ItemDragData} from 'src/TreeifyTab/View/dragAndDrop'

export type DragImageProps = {
  mousePosition: Coordinate
  itemDragData: ItemDragData
  onDrop: (event: MouseEvent, itemPath: ItemPath) => void
}

export function createDragImageProps(): DragImageProps | undefined {
  if (itemDragData === undefined || External.instance.mousePosition === undefined) return undefined

  function onDrop(event: MouseEvent, draggedItemPath: ItemPath) {
    doWithErrorCapture(() => {
      // エッジの付け替えを行うので、エッジが定義されない場合は何もしない
      const parentItemId = ItemPath.getParentItemId(draggedItemPath)
      if (parentItemId === undefined) return

      const itemElement = searchElementByYCoordinate(event.clientY)
      if (itemElement === undefined) return

      const itemPath: ItemPath = List(JSON.parse(itemElement.dataset.itemPath!))

      const rect = itemElement.getBoundingClientRect()
      if (event.clientX < rect.x) {
        // Spoolへのドロップの場合

        // どのアイテムのSpoolにドロップしたかを探索する
        const spoolDroppedItemPath = searchElementByXCoordinate(itemPath, event.clientX)

        const spoolDroppedItemId = ItemPath.getItemId(spoolDroppedItemPath)
        const draggedItemId = ItemPath.getItemId(draggedItemPath)
        const isDisplayingChildItemIds =
          !CurrentState.getDisplayingChildItemIds(spoolDroppedItemPath).isEmpty()

        if (is(spoolDroppedItemPath.take(draggedItemPath.size), draggedItemPath)) {
          // 少し分かりづらいが、上記条件を満たすときはドラッグアンドドロップ移動を認めてはならない。
          // 下記の2パターンが該当する。
          // (A) 自分自身へドロップした場合（無意味だしエッジ付け替えの都合で消えてしまうので何もしなくていい）
          // (B) 自分の子孫へドロップした場合（変な循環参照を作る危険な操作なので認めてはならない）
          return
        }

        // エッジの付け替えを行うので、エッジが定義されない場合は何もしない
        const parentItemId = ItemPath.getParentItemId(draggedItemPath)
        if (parentItemId === undefined) return

        if (event.altKey) {
          if (!CurrentState.isSibling(spoolDroppedItemPath, draggedItemPath)) {
            // エッジを追加する（トランスクルード）
            if (isDisplayingChildItemIds) {
              CurrentState.insertLastChildItem(spoolDroppedItemId, draggedItemId)
            } else {
              CurrentState.insertFirstChildItem(spoolDroppedItemId, draggedItemId)
            }
          }
        } else {
          // targetItemPathが実在しなくなるので退避
          const aboveItemPath = CurrentState.findAboveItemPath(draggedItemPath)
          assertNonUndefined(aboveItemPath)
          CurrentState.setTargetItemPath(aboveItemPath)

          // エッジを付け替える
          const edge = CurrentState.removeItemGraphEdge(parentItemId, draggedItemId)
          if (isDisplayingChildItemIds) {
            CurrentState.insertLastChildItem(spoolDroppedItemId, draggedItemId, edge)
          } else {
            CurrentState.insertFirstChildItem(spoolDroppedItemId, draggedItemId, edge)
          }
        }

        CurrentState.updateItemTimestamp(draggedItemId)
        Rerenderer.instance.rerender()
      } else {
        // Spool以外の場所へのドロップの場合

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
    })
  }

  return {
    mousePosition: External.instance.mousePosition,
    itemDragData,
    onDrop,
  }
}

// 指定されたY座標に表示されているアイテムのコンテンツエリアのDOM要素を返す
function searchElementByYCoordinate(y: integer): HTMLElement | undefined {
  // メインエリア内の全アイテムをリスト化し、Y座標でソート
  const elements = document.getElementsByClassName('main-area-node_content-area')
  const sortedElements = List(elements).sortBy((element) => {
    return element.getBoundingClientRect().bottom
  }) as List<HTMLElement>

  for (const element of sortedElements) {
    const rect = element.getBoundingClientRect()
    if (rect.top <= y && y <= rect.bottom) {
      return element
    }
  }
  return undefined
}

// ItemPathの親を辿り、指定されたX座標にSpoolを表示しているItemPathを探索する
function searchElementByXCoordinate(itemPath: ItemPath, x: integer): ItemPath {
  console.assert(!itemPath.isEmpty())

  const element = document.getElementById(JSON.stringify(itemPath))
  assertNonNull(element)
  if (element.getBoundingClientRect().x < x) {
    return itemPath
  }

  return searchElementByXCoordinate(itemPath.pop(), x)
}
