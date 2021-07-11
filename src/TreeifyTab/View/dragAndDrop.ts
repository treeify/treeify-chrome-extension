import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export type ItemDragData = {
  itemPath: ItemPath
}

export let itemDragData: ItemDragData | undefined

/**
 * アイテムのドラッグ開始を行うDOM要素に対して設定するuseディレクティブ用関数。
 * TODO:標準のドラッグアンドドロップを用いない理由を説明する
 */
export function onItemDragStart(element: HTMLElement, itemPath: ItemPath) {
  let isAfterMouseDown = false

  function onMouseDown(event: MouseEvent) {
    if (event.buttons === 1) {
      isAfterMouseDown = true
    }
  }
  function onMouseMove(event: MouseEvent) {
    if (event.buttons === 1 && isAfterMouseDown) {
      itemDragData = {itemPath}
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

/**
 * アイテムのドロップ対象となるDOM要素に対して設定するuseディレクティブ用関数。
 * ドロップされたときのコールバックをパラメータとして指定する必要がある。
 */
export function onItemDrop(
  element: HTMLElement,
  onDrop: (event: MouseEvent, data: ItemDragData) => void
) {
  function onMouseUp(event: MouseEvent) {
    if (itemDragData !== undefined) {
      onDrop(event, itemDragData)
      itemDragData = undefined
      Rerenderer.instance.rerender()
    }
  }

  element.addEventListener('mouseup', onMouseUp)
  return {
    destroy() {
      element.removeEventListener('mouseup', onMouseUp)
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
    if (itemDragData !== undefined) {
      itemDragData = undefined
      Rerenderer.instance.rerender()
    }
  }
  function onMouseMove(event: MouseEvent) {
    if (!(event.buttons & 1) && itemDragData !== undefined) {
      itemDragData = undefined
      Rerenderer.instance.rerender()
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
