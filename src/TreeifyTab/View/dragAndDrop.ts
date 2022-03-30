import { ItemId } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { assertNonNull } from 'src/Utility/Debug/assert'
import { DiscriminatedUnion } from 'src/Utility/DiscriminatedUnion'
import { Coordinate, integer } from 'src/Utility/integer'

export type DragData = DiscriminatedUnion<{
  ItemDragData: {
    itemPath: ItemPath
    initialMousePosition: Coordinate
  }
  ImageResizeHandleDragData: {
    itemId: ItemId
    imageRectLeft: integer
  }
}>

// クリックしているつもりなのにドラッグ扱いされてしまう問題に対処するため導入した変数。
// ドラッグ開始の判断が早すぎるのが原因なので、ドラッグ開始座標から一定距離離れるまではドラッグ開始と判断しない。
let itemMouseDown: { position: Coordinate; itemPath: ItemPath } | undefined

/**
 * 項目のドラッグ開始を行うDOM要素に対して設定するuseディレクティブ用関数。
 * TODO:標準のドラッグアンドドロップを用いない理由を説明する
 */
export function dragItem(element: HTMLElement, itemPath: ItemPath) {
  function onMouseDown(event: MouseEvent) {
    if (event.buttons === 1) {
      itemMouseDown = { position: { x: event.clientX, y: event.clientY }, itemPath }
    }
  }

  element.addEventListener('mousedown', onMouseDown)
  return {
    destroy() {
      element.removeEventListener('mousedown', onMouseDown)
    },
  }
}

function calculateDistance(lhs: Coordinate, rhs: Coordinate): integer {
  return Math.sqrt((lhs.x - rhs.x) ** 2 + (lhs.y - rhs.y) ** 2)
}

export function dragImageResizeHandle(element: HTMLElement, itemId: ItemId) {
  let isAfterMouseDown = false

  function onMouseDown(event: MouseEvent) {
    event.preventDefault()
    if (event.buttons === 1) {
      isAfterMouseDown = true
    }
  }

  function onMouseMove(event: MouseEvent) {
    if (event.buttons === 1 && isAfterMouseDown) {
      assertNonNull(element.parentElement)

      // ドラッグ開始
      External.instance.currentDragData = {
        type: 'ImageResizeHandleDragData',
        itemId,
        imageRectLeft: element.parentElement.getBoundingClientRect().left,
      }
      Rerenderer.instance.rerender()
    }
    isAfterMouseDown = false
  }

  element.addEventListener('mousedown', onMouseDown)
  element.addEventListener('mousemove', onMouseMove)
  return {
    destroy() {
      element.removeEventListener('mousedown', onMouseDown)
      element.removeEventListener('mousemove', onMouseMove)
    },
  }
}

export function onResizeImage(
  element: HTMLElement,
  onDrag: (event: MouseEvent, itemId: ItemId, imageRectLeft: integer) => void
) {
  function onMouseMove(event: MouseEvent) {
    if (
      event.buttons === 1 &&
      External.instance.currentDragData?.type === 'ImageResizeHandleDragData'
    ) {
      onDrag(
        event,
        External.instance.currentDragData.itemId,
        External.instance.currentDragData.imageRectLeft
      )
    }
  }

  element.addEventListener('mousemove', onMouseMove)
  return {
    destroy() {
      element.removeEventListener('mousemove', onMouseMove)
    },
  }
}

/**
 * ドラッグアンドドロップの状態を正確に追跡するためには、
 * ドラッグやドロップの対象外となる要素の上でもマウスイベントを取得する必要がある。
 * そこで、ルート要素に対してuseディレクティブでこの関数を設定してもらう。
 */
export function dragStateResetter(element: HTMLElement) {
  function onMouseUp(event: MouseEvent) {
    if (External.instance.currentDragData !== undefined) {
      External.instance.currentDragData = undefined
      Rerenderer.instance.rerender()
    }
  }

  function onMouseMove(event: MouseEvent) {
    if (event.buttons === 1 && itemMouseDown !== undefined) {
      // ドラッグ開始座標から一定距離離れるまではドラッグ開始と判断しない
      const currentMousePosition = { x: event.clientX, y: event.clientY }
      const distance = calculateDistance(itemMouseDown.position, currentMousePosition)
      if (distance > 5) {
        External.instance.currentDragData = {
          type: 'ItemDragData',
          itemPath: itemMouseDown.itemPath,
          initialMousePosition: currentMousePosition,
        }
        CurrentState.setTargetItemPath(itemMouseDown.itemPath)
        itemMouseDown = undefined
        Rerenderer.instance.rerender()
      }
    }

    if ((event.buttons & 1) === 0) {
      itemMouseDown = undefined

      if (External.instance.currentDragData !== undefined) {
        External.instance.currentDragData = undefined
        Rerenderer.instance.rerender()
      }
    }
  }

  element.addEventListener('mouseup', onMouseUp)
  element.addEventListener('mousemove', onMouseMove)
  return {
    destroy() {
      element.removeEventListener('mouseup', onMouseUp)
      element.removeEventListener('mousemove', onMouseMove)
    },
  }
}
