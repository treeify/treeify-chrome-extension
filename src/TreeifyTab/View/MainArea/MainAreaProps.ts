import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { matchTabsAndWebPageItems } from 'src/TreeifyTab/External/chromeEventListeners'
import {
  focusMainAreaBackground,
  getTextItemSelectionFromDom,
  setDomSelection,
} from 'src/TreeifyTab/External/domTextSelection'
import { Chunk } from 'src/TreeifyTab/Internal/Chunk'
import { Command } from 'src/TreeifyTab/Internal/Command'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Database } from 'src/TreeifyTab/Internal/Database'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { SearchEngine } from 'src/TreeifyTab/Internal/SearchEngine/SearchEngine'
import { CommandId, State } from 'src/TreeifyTab/Internal/State'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import {
  createMainAreaNodeProps,
  MainAreaNodeProps,
} from 'src/TreeifyTab/View/MainArea/MainAreaNodeProps'
import { CssCustomProperty } from 'src/Utility/browser'
import { assertNonNull, assertNonUndefined } from 'src/Utility/Debug/assert'
import { NERArray$, RArray } from 'src/Utility/fp-ts'
import { integer } from 'src/Utility/integer'
import { tick } from 'svelte'

export type MainAreaProps = {
  rootNodeProps: MainAreaNodeProps
  onKeyDown(event: KeyboardEvent): void
  onResizeImage(event: MouseEvent, itemId: ItemId, imageRectRight: integer): void
}

export function createMainAreaProps(state: State): MainAreaProps {
  const rootItemPath = [CurrentState.getActivePageId()]

  const allDisplayingItemIds = [...CurrentState.getAllDisplayingItemIds(state, rootItemPath)]
  // 足跡表示数を計算
  const exponent = CssCustomProperty.getNumber('--main-area-footprint-count-exponent') ?? 0.5
  const footprintCount = Math.floor(allDisplayingItemIds.length ** exponent)

  const sorted = allDisplayingItemIds.sort((a: ItemId, b: ItemId) => {
    return state.items[b].timestamp - state.items[a].timestamp
  })

  // 各項目に足跡順位を対応付け
  const footprintRankMap = new Map<ItemId, integer>()
  for (let i = 0; i < footprintCount; i++) {
    footprintRankMap.set(sorted[i], i)
  }

  return {
    rootNodeProps: createMainAreaNodeProps(state, footprintRankMap, footprintCount, rootItemPath),
    onKeyDown,
    onResizeImage,
  }
}

async function onKeyDown(event: KeyboardEvent) {
  // IME入力中やIME確定時（特にEnterキー）はTreeifyの処理が暴発しないようにする。
  // 参考：https://qiita.com/ledsun/items/31e43a97413dd3c8e38e
  if (event.isComposing) return

  const inputId = InputId.fromKeyboardEvent(event)
  switch (inputId) {
    case '0000ArrowLeft':
      onArrowLeft(event)
      return
    case '0000ArrowRight':
      onArrowRight(event)
      return
    case '0000ArrowUp':
      onArrowUp(event)
      return
    case '0000ArrowDown':
      onArrowDown(event)
      return
    case '0100ArrowUp':
      onShiftArrowUp(event)
      return
    case '0100ArrowDown':
      onShiftArrowDown(event)
      return
    case '0000Backspace':
    case '1000Backspace':
      onBackspace(event)
      return
    case '0000Delete':
      onDelete(event)
      return
    case '0000Space':
      onSpace(event)
      return
    case '1000KeyA':
      event.preventDefault()
      CurrentState.selectAll()
      Rerenderer.instance.rerender()
      return
    case '1000KeyZ':
      event.preventDefault()
      undo()
      return
  }

  const commandIds: RArray<CommandId> | undefined =
    Internal.instance.state.mainAreaKeyBindings[inputId]
  if (commandIds !== undefined) {
    event.preventDefault()

    Internal.instance.saveCurrentStateToUndoStack()

    for (const commandId of commandIds) {
      // @ts-ignore
      Command[commandId]?.()
      Rerenderer.instance.rerender()
      await tick()
    }
  }
}

/**
 * ←キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowLeft(event: KeyboardEvent) {
  const targetItemPath = CurrentState.getTargetItemPath()

  const aboveItemPath = CurrentState.findAboveItemPath(targetItemPath)
  // 上の項目が存在しない場合はブラウザの挙動に任せる
  if (aboveItemPath === undefined) return

  const aboveItemId = ItemPath.getItemId(aboveItemPath)

  const textItemSelection = getTextItemSelectionFromDom()
  if (textItemSelection === undefined) {
    event.preventDefault()
    CurrentState.setTargetItemPath(aboveItemPath)

    const aboveItemType = Internal.instance.state.items[aboveItemId].type
    if (aboveItemType === ItemType.TEXT) {
      // 上の項目がテキスト項目の場合、キャレットをその末尾に移動する
      const domishObjects = Internal.instance.state.textItems[aboveItemId].domishObjects
      const textLength = DomishObject.getTextLength(domishObjects)
      Rerenderer.instance.requestToSetCaretPosition(textLength)
    }

    Rerenderer.instance.requestToScrollAbove()
    Rerenderer.instance.rerender()
  } else {
    // キャレット位置が先頭以外のときはブラウザの挙動に任せる
    if (textItemSelection.focusDistance > 0 || textItemSelection.anchorDistance > 0) {
      return
    }

    event.preventDefault()
    CurrentState.setTargetItemPath(aboveItemPath)

    const aboveItemType = Internal.instance.state.items[aboveItemId].type
    if (aboveItemType === ItemType.TEXT) {
      // 上の項目がテキスト項目の場合、キャレットをその末尾に移動する
      const domishObjects = Internal.instance.state.textItems[aboveItemId].domishObjects
      const textLength = DomishObject.getTextLength(domishObjects)
      Rerenderer.instance.requestToSetCaretPosition(textLength)
    }

    Rerenderer.instance.requestToScrollAbove()
    Rerenderer.instance.rerender()
  }
}

/**
 * →キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowRight(event: KeyboardEvent) {
  const targetItemPath = CurrentState.getTargetItemPath()
  const belowItemPath = CurrentState.findBelowItemPath(targetItemPath)
  // 下の項目が存在しない場合はブラウザの挙動に任せる
  if (belowItemPath === undefined) return

  const textItemSelection = getTextItemSelectionFromDom()
  if (textItemSelection === undefined) {
    event.preventDefault()
    CurrentState.setTargetItemPath(belowItemPath)
    Rerenderer.instance.requestToFocusTargetItem()
    Rerenderer.instance.requestToScrollBelow()
    Rerenderer.instance.rerender()
  } else {
    const targetItemId = ItemPath.getItemId(targetItemPath)
    const domishObjects = Internal.instance.state.textItems[targetItemId].domishObjects
    const textLength = DomishObject.getTextLength(domishObjects)

    // キャレット位置が末尾以外のときはブラウザの挙動に任せる
    if (
      textItemSelection.focusDistance < textLength ||
      textItemSelection.anchorDistance < textLength
    ) {
      return
    }

    // 下の項目をフォーカスする。
    // （下の項目がテキスト項目の場合、キャレットはその先頭に移動する）
    event.preventDefault()
    CurrentState.setTargetItemPath(belowItemPath)
    Rerenderer.instance.requestToFocusTargetItem()
    Rerenderer.instance.requestToScrollBelow()
    Rerenderer.instance.rerender()
  }
}

/**
 * ↑キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowUp(event: KeyboardEvent) {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const aboveItemPath = CurrentState.findAboveItemPath(selectedItemPaths[0])
  // 上の項目が存在しない場合はブラウザの挙動に任せる
  if (aboveItemPath === undefined) return

  // 複数選択などの場合、上の項目をフォーカスするだけで終了
  const targetItemPath = CurrentState.getTargetItemPath()
  if (document.activeElement?.id !== MainAreaContentView.focusableDomElementId(targetItemPath)) {
    event.preventDefault()
    CurrentState.setTargetItemPath(aboveItemPath)
    Rerenderer.instance.requestToFocusTargetItem()
    Rerenderer.instance.requestToScrollAbove()
    Rerenderer.instance.rerender()
    return
  }

  const targetItemId = ItemPath.getItemId(targetItemPath)
  if (Internal.instance.state.items[targetItemId].type === ItemType.TEXT) {
    // ターゲット項目がテキスト項目の場合

    assertNonNull(document.activeElement)
    const activeElementRect = document.activeElement?.getBoundingClientRect()
    const selectionRect = getSelection()?.getRangeAt(0)?.getBoundingClientRect()
    assertNonUndefined(selectionRect)

    // キャレットが先頭または空行に居るときにどういうわけかselectionRectの値が全て0になることがある問題への対処
    const focusDistance = getTextItemSelectionFromDom()?.focusDistance
    if (selectionRect.bottom === 0 && focusDistance !== undefined && focusDistance > 0) {
      return
    }

    // キャレットが最初の行以外にいるときはブラウザの挙動に任せる
    const fontSize = getComputedStyle(document.activeElement).getPropertyValue('font-size')
    if (selectionRect.top - activeElementRect.top > parseFloat(fontSize) / 2) {
      return
    }
  }

  event.preventDefault()
  moveFocusToAboveItem(aboveItemPath)
}

function moveFocusToAboveItem(aboveItemPath: ItemPath) {
  const aboveItemId = ItemPath.getItemId(aboveItemPath)
  if (Internal.instance.state.items[aboveItemId].type === ItemType.TEXT) {
    // 上の項目がテキスト項目の場合、X座標をできるだけ保つようなキャレット移動を行う

    // 現在のX座標を取得
    const originalXCoordinate = getCaretXCoordinate()
    assertNonUndefined(originalXCoordinate)

    // 上の項目の最後の行の文字数を取得
    const aboveItemDomishObjects = Internal.instance.state.textItems[aboveItemId].domishObjects
    const lines = DomishObject.toPlainText(aboveItemDomishObjects).split(/\r?\n/)
    const lastLine = lines[lines.length - 1]

    // 上の項目に一旦フォーカスする
    const aboveItemDomElementId = MainAreaContentView.focusableDomElementId(aboveItemPath)
    const aboveItemDomElement = document.getElementById(aboveItemDomElementId)
    assertNonNull(aboveItemDomElement)
    aboveItemDomElement.focus({ preventScroll: true })

    const textLength = DomishObject.getTextLength(aboveItemDomishObjects)
    // キャレット位置を最後の行の右端からスタートし、左にずらしていく
    let i = textLength
    for (; textLength - lastLine.length <= i; i--) {
      setCaretPosition(i)
      const caretXCoordinate = getCaretXCoordinate()!
      if (caretXCoordinate === originalXCoordinate) {
        CurrentState.setTargetItemPath(aboveItemPath)
        Rerenderer.instance.requestToFocusTargetItem(getTextItemSelectionFromDom())
        Rerenderer.instance.requestToScrollAbove()
        Rerenderer.instance.rerender()
        return
      }
      if (caretXCoordinate < originalXCoordinate) {
        break
      }
    }
    // もしi < 0なら既にsetCaretPosition(0)が実行済みなので、このままreturnしていい
    if (i < 0) {
      CurrentState.setTargetItemPath(aboveItemPath)
      Rerenderer.instance.requestToFocusTargetItem(getTextItemSelectionFromDom())
      Rerenderer.instance.requestToScrollAbove()
      Rerenderer.instance.rerender()
      return
    }

    // キャレットのX座標の移動距離が最も小さくなるようなpositionを選ぶ
    if (i < textLength) {
      // TODO: 最適化の余地あり（setCaretPositionやgetCaretXCoordinateの呼び出し回数）
      setCaretPosition(i + 1)
      const firstDistance = Math.abs(originalXCoordinate - getCaretXCoordinate()!)
      setCaretPosition(i)
      const secondDistance = Math.abs(originalXCoordinate - getCaretXCoordinate()!)
      if (firstDistance < secondDistance) {
        setCaretPosition(i + 1)
      }
    }
  }

  CurrentState.setTargetItemPath(aboveItemPath)
  Rerenderer.instance.requestToFocusTargetItem(getTextItemSelectionFromDom())
  Rerenderer.instance.requestToScrollAbove()
  Rerenderer.instance.rerender()
}

/**
 * ↓キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowDown(event: KeyboardEvent) {
  const bottomItemPath = NERArray$.last(CurrentState.getSelectedItemPaths())
  const belowItemPath = CurrentState.findBelowItemPath(bottomItemPath)

  // 複数選択などの場合、下の項目をフォーカスするだけで終了
  const targetItemPath = CurrentState.getTargetItemPath()
  if (document.activeElement?.id !== MainAreaContentView.focusableDomElementId(targetItemPath)) {
    event.preventDefault()
    if (belowItemPath !== undefined) {
      CurrentState.setTargetItemPath(belowItemPath)
    } else {
      CurrentState.setTargetItemPath(bottomItemPath)
    }
    Rerenderer.instance.requestToFocusTargetItem()
    Rerenderer.instance.requestToScrollBelow()
    Rerenderer.instance.rerender()
    return
  }

  // 下の項目が存在しない場合はブラウザの挙動に任せる
  if (belowItemPath === undefined) return

  const targetItemId = ItemPath.getItemId(targetItemPath)
  if (Internal.instance.state.items[targetItemId].type === ItemType.TEXT) {
    // ターゲット項目がテキスト項目の場合

    assertNonNull(document.activeElement)
    const activeElementRect = document.activeElement?.getBoundingClientRect()
    const selectionRect = getSelection()?.getRangeAt(0)?.getBoundingClientRect()
    assertNonUndefined(selectionRect)

    if (selectionRect.bottom === 0) {
      // キャレットが先頭または空行に居るときにどういうわけかselectionRectの値が全て0になることがある問題への対処

      // キャレットが末尾にいるかどうかを文字数計算によって判定し、もし末尾なら下の項目をフォーカスして終了
      const textItemSelection = getTextItemSelectionFromDom()
      const domishObjects = Internal.instance.state.textItems[targetItemId].domishObjects
      const textLength = DomishObject.getTextLength(domishObjects)
      if (textItemSelection !== undefined && textItemSelection.focusDistance === textLength) {
        event.preventDefault()
        CurrentState.setTargetItemPath(belowItemPath)
        Rerenderer.instance.requestToFocusTargetItem()
        Rerenderer.instance.requestToScrollBelow()
        Rerenderer.instance.rerender()
        return
      }

      const fontSize = getComputedStyle(document.activeElement).getPropertyValue('font-size')
      if (activeElementRect.height >= parseFloat(fontSize) * 2) {
        // br要素を含むか、あるいは折り返しが起こっている場合はブラウザの挙動に任せる
        return
      }
    } else {
      // キャレットが最後の行以外にいるときはブラウザの挙動に任せる
      const fontSize = getComputedStyle(document.activeElement).getPropertyValue('font-size')
      if (activeElementRect.bottom - selectionRect.bottom > parseFloat(fontSize) / 2) {
        return
      }
    }
  }

  event.preventDefault()
  moveFocusToBelowItem(belowItemPath)
}

function moveFocusToBelowItem(belowItemPath: ItemPath) {
  const belowItemId = ItemPath.getItemId(belowItemPath)
  if (Internal.instance.state.items[belowItemId].type === ItemType.TEXT) {
    // 下の項目がテキスト項目の場合、X座標をできるだけ保つようなキャレット移動を行う

    // 現在のX座標を取得
    const originalXCoordinate = getCaretXCoordinate()
    assertNonUndefined(originalXCoordinate)

    // 下の項目の最初の行の文字数を取得
    const belowItemDomishObjects = Internal.instance.state.textItems[belowItemId].domishObjects
    const firstLine = DomishObject.toPlainText(belowItemDomishObjects).split(/\r?\n/)[0]

    // 下の項目に一旦フォーカスする（キャレット位置を左端からスタートし、右にずらしていく）
    // TODO: 最適化の余地あり。二分探索が可能では？
    const belowItemDomElementId = MainAreaContentView.focusableDomElementId(belowItemPath)
    const belowItemDomElement = document.getElementById(belowItemDomElementId)
    assertNonNull(belowItemDomElement)
    belowItemDomElement.focus({ preventScroll: true })

    let i = 0
    for (; i < firstLine.length; i++) {
      setCaretPosition(i)
      if (getCaretXCoordinate()! > originalXCoordinate) {
        break
      }
    }
    // キャレットのX座標の移動距離が最も小さくなるようなpositionを選ぶ
    if (i > 0) {
      // TODO: 最適化の余地あり（setCaretPositionやgetCaretXCoordinateの呼び出し回数）
      setCaretPosition(i - 1)
      const firstDistance = Math.abs(originalXCoordinate - getCaretXCoordinate()!)
      setCaretPosition(i)
      const secondDistance = Math.abs(originalXCoordinate - getCaretXCoordinate()!)
      if (firstDistance < secondDistance) {
        setCaretPosition(i - 1)
      }
    }
  }
  CurrentState.setTargetItemPath(belowItemPath)
  Rerenderer.instance.requestToFocusTargetItem(getTextItemSelectionFromDom())
  Rerenderer.instance.requestToScrollBelow()
  Rerenderer.instance.rerender()
}

function setCaretPosition(position: integer) {
  assertNonNull(document.activeElement)
  setDomSelection(document.activeElement, {
    focusDistance: position,
    anchorDistance: position,
  })
}

function getCaretXCoordinate(): integer | undefined {
  const selection = getSelection()
  if (selection !== null && selection.rangeCount > 0) {
    if (selection.getRangeAt(0).getBoundingClientRect().left === 0) {
      // どういうわけかキャレットが先頭に居るときにX座標が0扱いになってしまう問題の対策
      // TODO: marginなどを入れられると破綻するのでは
      return document.activeElement?.getBoundingClientRect().left
    }
    return selection.getRangeAt(0).getBoundingClientRect().left
  }
  return undefined
}

/**
 * Shift+↑キー押下時の処理。項目の複数選択を行うためのもの。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onShiftArrowUp(event: KeyboardEvent) {
  const targetItemPath = CurrentState.getTargetItemPath()
  const prevSiblingItemPath = CurrentState.findPrevSiblingItemPath(targetItemPath)
  // 兄項目が存在しない場合はブラウザの挙動に任せる
  if (prevSiblingItemPath === undefined) return

  if (CurrentState.getSelectedItemPaths().length === 1) {
    const targetItemId = ItemPath.getItemId(targetItemPath)
    if (Internal.instance.state.items[targetItemId].type === ItemType.TEXT) {
      // ターゲット項目がテキスト項目の場合

      const textItemSelection = getTextItemSelectionFromDom()
      if (textItemSelection !== undefined && textItemSelection.focusDistance > 0) {
        return
      }
    }
  }

  event.preventDefault()
  CurrentState.setTargetItemPathOnly(prevSiblingItemPath)
  // 複数選択中はメインエリア自体をフォーカスする
  focusMainAreaBackground()
  Rerenderer.instance.requestToScrollAbove()
  Rerenderer.instance.rerender()
}

/**
 * Shift+↓キー押下時の処理。項目の複数選択を行うためのもの。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onShiftArrowDown(event: KeyboardEvent) {
  const targetItemPath = CurrentState.getTargetItemPath()
  const nextSiblingItemPath = CurrentState.findNextSiblingItemPath(targetItemPath)
  // 弟項目が存在しない場合はブラウザの挙動に任せる
  if (nextSiblingItemPath === undefined) return

  if (CurrentState.getSelectedItemPaths().length === 1) {
    const targetItemId = ItemPath.getItemId(targetItemPath)
    if (Internal.instance.state.items[targetItemId].type === ItemType.TEXT) {
      // ターゲット項目がテキスト項目の場合

      const domishObjects = Internal.instance.state.textItems[targetItemId].domishObjects
      const textLength = DomishObject.getTextLength(domishObjects)
      const textItemSelection = getTextItemSelectionFromDom()
      if (textItemSelection !== undefined && textItemSelection.focusDistance < textLength) {
        return
      }
    }
  }

  event.preventDefault()
  CurrentState.setTargetItemPathOnly(nextSiblingItemPath)
  // 複数選択中はメインエリア自体をフォーカスする
  focusMainAreaBackground()
  Rerenderer.instance.requestToScrollBelow()
  Rerenderer.instance.rerender()
}

/** メインエリア上でBackspaceキーを押したときのデフォルトの挙動 */
function onBackspace(event: KeyboardEvent) {
  // 複数選択中は選択された項目を削除して終了
  if (CurrentState.getSelectedItemPaths().length > 1) {
    event.preventDefault()
    Internal.instance.saveCurrentStateToUndoStack()
    Command.removeItem()
    Rerenderer.instance.requestToFocusTargetItem()
    Rerenderer.instance.rerender()
    return
  }

  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const targetItem = Internal.instance.state.items[targetItemId]
  if (targetItem.type === ItemType.TEXT) {
    // ターゲット項目がテキスト項目の場合

    const selection = getTextItemSelectionFromDom()
    if (selection === undefined) return

    // キャレットが先頭以外にあるならブラウザのデフォルトの挙動に任せる
    if (selection.focusDistance > 0 || selection.anchorDistance > 0) return

    const aboveItemPath = CurrentState.findAboveItemPath(targetItemPath)
    // アクティブ項目なら何もしない
    if (aboveItemPath === undefined) return

    const aboveItemId = ItemPath.getItemId(aboveItemPath)

    const domishObjects = Internal.instance.state.textItems[targetItemId].domishObjects
    // 空の子なし項目なら
    if (targetItem.childItemIds.length === 0 && DomishObject.getTextLength(domishObjects) === 0) {
      event.preventDefault()
      Internal.instance.saveCurrentStateToUndoStack()

      // ターゲット項目を削除して終了
      Command.removeItem()
      Rerenderer.instance.rerender()
      return
    }

    // 上の項目がテキスト項目以外の場合は何もしない
    if (Internal.instance.state.items[aboveItemId].type !== ItemType.TEXT) return

    // テキスト項目同士のマージを行う

    // ユーザー視点で何が起こったのか分かりにくいため、子項目リストの連結が必要な場合は何もしない
    if (
      targetItem.childItemIds.length > 0 &&
      Internal.instance.state.items[aboveItemId].childItemIds.length > 0
    ) {
      return
    }

    for (const childItemId of targetItem.childItemIds) {
      CurrentState.throwIfCantInsertChildItem(aboveItemId, childItemId)
    }

    Internal.instance.saveCurrentStateToUndoStack()

    const aboveItemDomishObjects = Internal.instance.state.textItems[aboveItemId].domishObjects

    if (
      DomishObject.getTextLength(domishObjects) >
        DomishObject.getTextLength(aboveItemDomishObjects) &&
      aboveItemPath.length === targetItemPath.length
    ) {
      // 下の項目の方が文字数が多い場合、上の項目を下の項目にマージする

      CurrentState.setTextItemDomishObjects(
        targetItemId,
        aboveItemDomishObjects.concat(domishObjects)
      )

      CurrentState.deleteItem(aboveItemId)

      // キャレットを移動する
      Rerenderer.instance.requestToSetCaretPosition(
        DomishObject.getTextLength(aboveItemDomishObjects)
      )
    } else {
      // 上の項目の方が文字数が多い場合、下の項目を上の項目にマージする

      CurrentState.setTextItemDomishObjects(
        aboveItemId,
        aboveItemDomishObjects.concat(domishObjects)
      )

      // 子リストを連結するため、子を全て弟としてエッジ追加。
      // アンインデントに似ているが元のエッジを削除しない点が異なる。
      for (const childItemId of targetItem.childItemIds) {
        const edge = Internal.instance.state.items[childItemId].parents[targetItemId]
        CurrentState.insertLastChildItem(aboveItemId, childItemId, edge)
      }

      // ↑の元のエッジごと削除
      CurrentState.deleteItem(targetItemId)

      // 上の項目の元の末尾にキャレットを移動する
      CurrentState.setTargetItemPath(aboveItemPath)
      Rerenderer.instance.requestToSetCaretPosition(
        DomishObject.getTextLength(aboveItemDomishObjects)
      )
    }

    event.preventDefault()
    Rerenderer.instance.rerender()
  } else {
    // ターゲット項目がテキスト項目以外の場合

    event.preventDefault()
    Internal.instance.saveCurrentStateToUndoStack()
    // ターゲット項目を削除する
    Command.removeItem()
    Rerenderer.instance.rerender()
  }
}

/** メインエリア上でDeleteキーを押したときのデフォルトの挙動 */
function onDelete(event: KeyboardEvent) {
  // 複数選択中は選択された項目を削除して終了
  if (CurrentState.getSelectedItemPaths().length > 1) {
    event.preventDefault()
    Internal.instance.saveCurrentStateToUndoStack()
    Command.removeItem()
    // 下の項目をフォーカスする
    const belowItemPath = CurrentState.findBelowItemPath(CurrentState.getTargetItemPath())
    if (belowItemPath !== undefined) {
      CurrentState.setTargetItemPath(belowItemPath)
    }
    Rerenderer.instance.rerender()
    return
  }

  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const targetItem = Internal.instance.state.items[targetItemId]
  if (targetItem.type === ItemType.TEXT) {
    // ターゲット項目がテキスト項目の場合

    const selection = getTextItemSelectionFromDom()
    if (selection === undefined) return

    const domishObjects = Internal.instance.state.textItems[targetItemId].domishObjects
    const textLength = DomishObject.getTextLength(domishObjects)
    // キャレットが末尾以外にあるならブラウザの標準の挙動に任せる
    if (selection.focusDistance !== textLength || selection.anchorDistance !== textLength) {
      return
    }

    const belowItemPath = CurrentState.findBelowItemPath(targetItemPath)
    // 一番下の項目なら何もしない
    if (belowItemPath === undefined) return

    // 空の子なし項目なら
    if (targetItem.childItemIds.length === 0 && DomishObject.getTextLength(domishObjects) === 0) {
      event.preventDefault()
      Internal.instance.saveCurrentStateToUndoStack()
      // ターゲット項目を削除して終了
      Command.removeItem()
      // 下の項目をフォーカスする
      const belowItemPath = CurrentState.findBelowItemPath(CurrentState.getTargetItemPath())
      if (belowItemPath !== undefined) {
        CurrentState.setTargetItemPath(belowItemPath)
      }
      Rerenderer.instance.requestToFocusTargetItem()
      Rerenderer.instance.rerender()
      return
    }

    const belowItemId = ItemPath.getItemId(belowItemPath)
    // ユーザー視点で何が起こったのか分かりにくいため、子項目リストの連結が必要な場合は何もしない
    if (
      targetItem.childItemIds.length > 0 &&
      Internal.instance.state.items[belowItemId].childItemIds.length > 0
    ) {
      return
    }

    const belowItem = Internal.instance.state.items[belowItemId]

    // 下の項目がテキスト項目以外の場合は何もしない
    if (belowItem.type !== ItemType.TEXT) return

    // ターゲット項目も下の項目もテキスト項目の場合、テキスト項目同士のマージを行う

    for (const childItemId of belowItem.childItemIds) {
      CurrentState.throwIfCantInsertChildItem(targetItemId, childItemId)
    }

    Internal.instance.saveCurrentStateToUndoStack()

    const belowItemDomishObjects = Internal.instance.state.textItems[belowItemId].domishObjects

    if (
      DomishObject.getTextLength(belowItemDomishObjects) >
        DomishObject.getTextLength(domishObjects) &&
      belowItemPath.length === targetItemPath.length
    ) {
      CurrentState.setTextItemDomishObjects(
        belowItemId,
        domishObjects.concat(belowItemDomishObjects)
      )

      // ↑の元のエッジごと削除
      CurrentState.deleteItem(targetItemId)

      // キャレット位置を更新する
      CurrentState.setTargetItemPath(belowItemPath)
      Rerenderer.instance.requestToSetCaretPosition(DomishObject.getTextLength(domishObjects))
    } else {
      CurrentState.setTextItemDomishObjects(
        targetItemId,
        domishObjects.concat(belowItemDomishObjects)
      )

      // 子リストを連結するため、下の項目の子を全てその弟としてエッジ追加。
      // アンインデントに似ているが元のエッジを削除しない点が異なる。
      for (const childItemId of belowItem.childItemIds) {
        const edge = Internal.instance.state.items[childItemId].parents[belowItemId]
        CurrentState.insertLastChildItem(targetItemId, childItemId, edge)
      }

      // ↑の元のエッジごと削除
      CurrentState.deleteItem(belowItemId)

      // 元のキャレット位置を維持する
      Rerenderer.instance.requestToSetCaretPosition(DomishObject.getTextLength(domishObjects))
    }

    event.preventDefault()
    Rerenderer.instance.rerender()
  } else {
    // ターゲット項目がテキスト項目以外の場合

    event.preventDefault()
    Internal.instance.saveCurrentStateToUndoStack()
    // ターゲット項目を削除する
    Command.removeItem()
    // 下の項目をフォーカスする
    const belowItemPath = CurrentState.findBelowItemPath(CurrentState.getTargetItemPath())
    if (belowItemPath !== undefined) {
      CurrentState.setTargetItemPath(belowItemPath)
    }
    Rerenderer.instance.requestToFocusTargetItem()
    Rerenderer.instance.rerender()
  }
}

/** メインエリア上でSpaceキーを押したときのデフォルトの挙動 */
function onSpace(event: KeyboardEvent) {
  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  const targetItemType = Internal.instance.state.items[targetItemId].type
  if (targetItemType === ItemType.WEB_PAGE) {
    event.preventDefault()
    Command.browseTab()
    Rerenderer.instance.rerender()
  }
}

async function undo() {
  if (Internal.instance.undoStackTop.size > 0) {
    Internal.instance.undo()
    Internal.instance.searchEngine = new SearchEngine(Internal.instance.state)

    await matchTabsAndWebPageItems()

    Rerenderer.instance.requestToFocusTargetItem()
    Rerenderer.instance.rerender()

    // IndexedDBを新しいStateと一致するよう更新。
    // このawaitで待っている間にStateがミューテーションされる可能性が気がかり。
    await Database.clearAllChunks()
    // IndexedDBは基本的にwrite-onlyなので書き込み完了を待つ必要はない
    Database.writeChunks(Chunk.createAllChunks(Internal.instance.state))
  }
}

function onResizeImage(event: MouseEvent, itemId: ItemId, imageRectLeft: integer) {
  const widthPx = Math.max(0, event.clientX - imageRectLeft)
  CurrentState.setImageItemWidthPx(itemId, widthPx)
  Rerenderer.instance.rerender()
}
