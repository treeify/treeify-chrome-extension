import {is, List} from 'immutable'
import {assertNonNull, assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {
  focusItemTreeBackground,
  getTextItemSelectionFromDom,
  setDomSelection,
} from 'src/TreeifyWindow/External/domTextSelection'
import {External} from 'src/TreeifyWindow/External/External'
import {Command} from 'src/TreeifyWindow/Internal/Command'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {onCopy, onCut, onPaste} from 'src/TreeifyWindow/Internal/importAndExport'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {State} from 'src/TreeifyWindow/Internal/State'
import {createElement} from 'src/TreeifyWindow/View/createElement'
import {css} from 'src/TreeifyWindow/View/css'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {
  createItemTreeNodeViewModel,
  ItemTreeNodeView,
  ItemTreeNodeViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeNodeView'

export type ItemTreeViewModel = {
  rootNodeViewModel: ItemTreeNodeViewModel
}

export function createItemTreeViewModel(state: State): ItemTreeViewModel {
  const rootItemPath = List.of(CurrentState.getActivePageId())

  const allDisplayingItemIds = [...getAllDisplayingItemIds(state, rootItemPath)]
  // 足跡表示数を計算
  // TODO: パラメータをカスタマイズ可能にする。なおこれをCSS変数にしていいのかどうかは微妙な問題
  const footprintCount = Math.floor(Math.pow(allDisplayingItemIds.length, 0.5))

  // TODO: 同時に複数のアイテムが操作された場合でも足跡をきちんと表示できるように修正する
  const sorted = allDisplayingItemIds.sort((a: ItemId, b: ItemId) => {
    return state.items[b].timestamp - state.items[a].timestamp
  })

  // 各アイテムに足跡順位を対応付け
  const footprintRankMap = new Map<ItemId, integer>()
  for (let i = 0; i < footprintCount; i++) {
    footprintRankMap.set(sorted[i], i)
  }

  return {
    rootNodeViewModel: createItemTreeNodeViewModel(
      state,
      footprintRankMap,
      footprintCount,
      rootItemPath
    ),
  }
}

/**
 * 全ての子孫と自身のアイテムIDを返す。
 * ただし（折りたたみなどの理由で）表示されないアイテムはスキップする。
 */
function* getAllDisplayingItemIds(state: State, itemPath: ItemPath): Generator<ItemId> {
  yield ItemPath.getItemId(itemPath)
  for (const childItemId of CurrentState.getDisplayingChildItemIds(itemPath)) {
    yield* getAllDisplayingItemIds(state, itemPath.push(childItemId))
  }
}

/** アイテムツリーの全体のルートView */
export function ItemTreeView(viewModel: ItemTreeViewModel) {
  return createElement(
    'main',
    {
      class: 'item-tree',
      tabindex: '0',
    },
    {
      keydown: onKeyDown,
      dragover: onDragOver,
      drop: onDrop,
      copy: onCopy,
      cut: onCut,
      paste: onPaste,
    },
    [ItemTreeNodeView(viewModel.rootNodeViewModel)]
  )
}

function onKeyDown(event: KeyboardEvent) {
  doWithErrorCapture(() => {
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
        onBackspace(event)
        return
      case '0000Delete':
        onDelete(event)
        return
      case '0000 ':
        onSpace(event)
        return
    }

    const command: Command | undefined = Internal.instance.state.itemTreeKeyboardBinding[inputId]
    if (command !== undefined) {
      event.preventDefault()
      Command.execute(command)
      CurrentState.commit()
    }
  })
}

/**
 * ←キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowLeft(event: KeyboardEvent) {
  const targetItemPath = CurrentState.getTargetItemPath()

  const aboveItemPath = CurrentState.findAboveItemPath(targetItemPath)
  // 上のアイテムが存在しない場合はブラウザの挙動に任せる
  if (aboveItemPath === undefined) return

  const aboveItemId = ItemPath.getItemId(aboveItemPath)

  const textItemSelection = getTextItemSelectionFromDom()
  if (textItemSelection === undefined) {
    // ターゲットアイテムが非テキストアイテムだと断定する

    const aboveItemType = Internal.instance.state.items[aboveItemId].itemType
    if (aboveItemType === ItemType.TEXT) {
      // 上のアイテムがテキストアイテムの場合、キャレットをその末尾に移動する
      event.preventDefault()
      const domishObjects = Internal.instance.state.textItems[aboveItemId].domishObjects
      const characterCount = DomishObject.countCharacters(domishObjects)
      External.instance.requestSetCaretDistanceAfterRendering(characterCount)
      CurrentState.setTargetItemPath(aboveItemPath)
      CurrentState.commit()
    } else {
      // 上のアイテムがテキストアイテム以外の場合、それをフォーカスする
      event.preventDefault()
      CurrentState.setTargetItemPath(aboveItemPath)
      CurrentState.commit()
    }
  } else {
    // キャレット位置が先頭以外のときはブラウザの挙動に任せる
    if (textItemSelection.focusDistance > 0 || textItemSelection.anchorDistance > 0) {
      return
    }

    const aboveItemType = Internal.instance.state.items[aboveItemId].itemType
    if (aboveItemType === ItemType.TEXT) {
      // 上のアイテムがテキストアイテムの場合、キャレットをその末尾に移動する
      event.preventDefault()
      const domishObjects = Internal.instance.state.textItems[aboveItemId].domishObjects
      const characterCount = DomishObject.countCharacters(domishObjects)
      External.instance.requestSetCaretDistanceAfterRendering(characterCount)
      CurrentState.setTargetItemPath(aboveItemPath)
      CurrentState.commit()
    } else {
      // 上のアイテムがテキストアイテム以外の場合、それをフォーカスする
      event.preventDefault()
      CurrentState.setTargetItemPath(aboveItemPath)
      CurrentState.commit()
    }
  }
}

/**
 * →キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowRight(event: KeyboardEvent) {
  const targetItemPath = CurrentState.getTargetItemPath()
  const belowItemPath = CurrentState.findBelowItemPath(targetItemPath)
  // 下のアイテムが存在しない場合はブラウザの挙動に任せる
  if (belowItemPath === undefined) return

  const belowItemId = ItemPath.getItemId(belowItemPath)

  const textItemSelection = getTextItemSelectionFromDom()
  if (textItemSelection === undefined) {
    // ターゲットアイテムが非テキストアイテムだと断定する

    const belowItemType = Internal.instance.state.items[belowItemId].itemType
    if (belowItemType === ItemType.TEXT) {
      // 下のアイテムがテキストアイテムの場合、キャレットをその先頭に移動する
      event.preventDefault()
      External.instance.requestSetCaretDistanceAfterRendering(0)
      CurrentState.setTargetItemPath(belowItemPath)
      CurrentState.commit()
    } else {
      // 下のアイテムがテキストアイテム以外の場合、それをフォーカスする
      event.preventDefault()
      CurrentState.setTargetItemPath(belowItemPath)
      CurrentState.commit()
    }
  } else {
    const targetItemId = ItemPath.getItemId(targetItemPath)
    const domishObjects = Internal.instance.state.textItems[targetItemId].domishObjects
    const characterCount = DomishObject.countCharacters(domishObjects)

    // キャレット位置が末尾以外のときはブラウザの挙動に任せる
    if (
      textItemSelection.focusDistance < characterCount ||
      textItemSelection.anchorDistance < characterCount
    ) {
      return
    }

    const belowItemType = Internal.instance.state.items[belowItemId].itemType
    if (belowItemType === ItemType.TEXT) {
      // 下のアイテムがテキストアイテムの場合、キャレットをその先頭に移動する
      event.preventDefault()
      External.instance.requestSetCaretDistanceAfterRendering(0)
      CurrentState.setTargetItemPath(belowItemPath)
      CurrentState.commit()
    } else {
      // 下のアイテムがテキストアイテム以外の場合、それをフォーカスする
      event.preventDefault()
      CurrentState.setTargetItemPath(belowItemPath)
      CurrentState.commit()
    }
  }
}

/**
 * ↑キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowUp(event: KeyboardEvent) {
  const targetItemPath = CurrentState.getTargetItemPath()
  const aboveItemPath = CurrentState.findAboveItemPath(targetItemPath)
  // 上のアイテムが存在しない場合はブラウザの挙動に任せる
  if (aboveItemPath === undefined) return

  const targetItemId = ItemPath.getItemId(targetItemPath)
  if (Internal.instance.state.items[targetItemId].itemType === ItemType.TEXT) {
    // ターゲットアイテムがテキストアイテムの場合

    assertNonNull(document.activeElement)
    const activeElementRect = document.activeElement?.getBoundingClientRect()
    const selectionRect = getSelection()?.getRangeAt(0)?.getBoundingClientRect()
    assertNonUndefined(selectionRect)

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
  if (Internal.instance.state.items[aboveItemId].itemType === ItemType.TEXT) {
    // 上のアイテムがテキストアイテムの場合、X座標をできるだけ保つようなキャレット移動を行う

    // 現在のX座標を取得
    const originalXCoordinate = getCaretXCoordinate()
    assertNonUndefined(originalXCoordinate)

    // 上のアイテムの最後の行の文字数を取得
    const aboveItemDomishObjects = Internal.instance.state.textItems[aboveItemId].domishObjects
    const lines = DomishObject.toPlainText(aboveItemDomishObjects).split('\n')
    const lastLine = lines[lines.length - 1]

    // 上のアイテムに一旦フォーカスする
    const aboveItemDomElementId = ItemTreeContentView.focusableDomElementId(aboveItemPath)
    const aboveItemDomElement = document.getElementById(aboveItemDomElementId)
    assertNonNull(aboveItemDomElement)
    aboveItemDomElement.focus()

    const charactersCount = DomishObject.countCharacters(aboveItemDomishObjects)
    // キャレット位置を最後の行の右端からスタートし、左にずらしていく
    let i = charactersCount
    for (; charactersCount - lastLine.length <= i; i--) {
      setCaretPosition(i)
      const caretXCoordinate = getCaretXCoordinate()!
      if (caretXCoordinate === originalXCoordinate) {
        return
      }
      if (caretXCoordinate < originalXCoordinate) {
        break
      }
    }
    // もしi < 0なら既にsetCaretPosition(0)が実行済みなので、このままreturnしていい
    if (i < 0) return

    // キャレットのX座標の移動距離が最も小さくなるようなpositionを選ぶ
    if (i < charactersCount) {
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
  External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
  CurrentState.commit()
}

/**
 * ↓キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowDown(event: KeyboardEvent) {
  const targetItemPath = CurrentState.getTargetItemPath()
  const belowItemPath = CurrentState.findBelowItemPath(targetItemPath)
  // 下のアイテムが存在しない場合はブラウザの挙動に任せる
  if (belowItemPath === undefined) return

  const targetItemId = ItemPath.getItemId(targetItemPath)
  if (Internal.instance.state.items[targetItemId].itemType === ItemType.TEXT) {
    // ターゲットアイテムがテキストアイテムの場合

    assertNonNull(document.activeElement)
    const activeElementRect = document.activeElement?.getBoundingClientRect()
    const selectionRect = getSelection()?.getRangeAt(0)?.getBoundingClientRect()
    assertNonUndefined(selectionRect)

    if (selectionRect.bottom === 0) {
      // どういうわけかキャレットが先頭に居るときにselectionRectの値が全て0になってしまう問題への対処

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
  if (Internal.instance.state.items[belowItemId].itemType === ItemType.TEXT) {
    // 下のアイテムがテキストアイテムの場合、X座標をできるだけ保つようなキャレット移動を行う

    // 現在のX座標を取得
    const originalXCoordinate = getCaretXCoordinate()
    assertNonUndefined(originalXCoordinate)

    // 下のアイテムの最初の行の文字数を取得
    const belowItemDomishObjects = Internal.instance.state.textItems[belowItemId].domishObjects
    const firstLine = DomishObject.toPlainText(belowItemDomishObjects).split('\n')[0]

    // 下のアイテムに一旦フォーカスする（キャレット位置を左端からスタートし、右にずらしていく）
    // TODO: 最適化の余地あり。二分探索が可能では？
    const belowItemDomElementId = ItemTreeContentView.focusableDomElementId(belowItemPath)
    const belowItemDomElement = document.getElementById(belowItemDomElementId)
    assertNonNull(belowItemDomElement)
    belowItemDomElement.focus()

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
  External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
  CurrentState.commit()
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
 * Shift+↑キー押下時の処理。アイテムの複数選択を行うためのもの。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onShiftArrowUp(event: KeyboardEvent) {
  const targetItemPath = CurrentState.getTargetItemPath()
  const prevSiblingItemPath = CurrentState.findPrevSiblingItemPath(targetItemPath)
  // 兄アイテムが存在しない場合はブラウザの挙動に任せる
  if (prevSiblingItemPath === undefined) return

  if (CurrentState.getSelectedItemPaths().size === 1) {
    const targetItemId = ItemPath.getItemId(targetItemPath)
    if (Internal.instance.state.items[targetItemId].itemType === ItemType.TEXT) {
      // ターゲットアイテムがテキストアイテムの場合

      const textItemSelection = getTextItemSelectionFromDom()
      if (textItemSelection?.focusDistance !== 0) {
        return
      }
    }
  }

  event.preventDefault()
  CurrentState.setTargetItemPathOnly(prevSiblingItemPath)
  // 複数選択中はアイテムツリー自体をフォーカスする
  focusItemTreeBackground()
  CurrentState.commit()
}

/**
 * Shift+↓キー押下時の処理。アイテムの複数選択を行うためのもの。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onShiftArrowDown(event: KeyboardEvent) {
  const targetItemPath = CurrentState.getTargetItemPath()
  const nextSiblingItemPath = CurrentState.findNextSiblingItemPath(targetItemPath)
  // 弟アイテムが存在しない場合はブラウザの挙動に任せる
  if (nextSiblingItemPath === undefined) return

  if (CurrentState.getSelectedItemPaths().size === 1) {
    const targetItemId = ItemPath.getItemId(targetItemPath)
    if (Internal.instance.state.items[targetItemId].itemType === ItemType.TEXT) {
      // ターゲットアイテムがテキストアイテムの場合

      const domishObjects = Internal.instance.state.textItems[targetItemId].domishObjects
      const charactersCount = DomishObject.countCharacters(domishObjects)
      const textItemSelection = getTextItemSelectionFromDom()
      if (textItemSelection?.focusDistance !== charactersCount) {
        return
      }
    }
  }

  event.preventDefault()
  CurrentState.setTargetItemPathOnly(nextSiblingItemPath)
  // 複数選択中はアイテムツリー自体をフォーカスする
  focusItemTreeBackground()
  CurrentState.commit()
}

/** アイテムツリー上でBackspaceキーを押したときのデフォルトの挙動 */
function onBackspace(event: KeyboardEvent) {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  if (Internal.instance.state.items[targetItemId].itemType === ItemType.TEXT) {
    // ターゲットアイテムがテキストアイテムの場合

    const selection = getTextItemSelectionFromDom()
    assertNonUndefined(selection)
    if (selection.focusDistance === 0 && selection.anchorDistance === 0) {
      // キャレットが先頭にあるなら

      const aboveItemPath = CurrentState.findAboveItemPath(targetItemPath)
      // アクティブアイテムなら何もしない
      if (aboveItemPath === undefined) return

      const aboveItemId = ItemPath.getItemId(aboveItemPath)

      if (Internal.instance.state.items[aboveItemId].itemType !== ItemType.TEXT) {
        // 上のアイテムがテキストアイテム以外の場合
        // TODO: アイテム削除コマンドを実行するのがいいと思う
      } else {
        // ターゲットアイテムも上のアイテムもテキストアイテムの場合、テキストアイテム同士のマージを行う

        // テキストを連結
        const focusedItemDomishObjects =
          Internal.instance.state.textItems[targetItemId].domishObjects
        const aboveItemDomishObjects = Internal.instance.state.textItems[aboveItemId].domishObjects
        // TODO: テキストノード同士が連結されないことが気がかり
        CurrentState.setTextItemDomishObjects(
          aboveItemId,
          aboveItemDomishObjects.concat(focusedItemDomishObjects)
        )

        // 子リストを連結するため、子を全て弟としてエッジ追加。
        // アンインデントに似ているが元のエッジを削除しない点が異なる。
        for (const childItemId of Internal.instance.state.items[targetItemId].childItemIds) {
          CurrentState.insertNextSiblingItem(targetItemPath, childItemId)
        }

        // ↑の元のエッジごと削除
        CurrentState.deleteItem(targetItemId)

        // 上のアイテムの元の末尾にキャレットを移動する
        CurrentState.setTargetItemPath(aboveItemPath)
        External.instance.requestSetCaretDistanceAfterRendering(
          DomishObject.countCharacters(aboveItemDomishObjects)
        )

        event.preventDefault()
        CurrentState.commit()
      }
    }
  } else {
    // ターゲットアイテムがテキストアイテム以外の場合
    // TODO: アイテム削除コマンドを実行するのがいいと思う
  }
}

/** アイテムツリー上でDeleteキーを押したときのデフォルトの挙動 */
function onDelete(event: KeyboardEvent) {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  if (Internal.instance.state.items[targetItemId].itemType === ItemType.TEXT) {
    // ターゲットアイテムがテキストアイテムの場合

    const selection = getTextItemSelectionFromDom()
    assertNonUndefined(selection)

    const focusedItemDomishObjects = Internal.instance.state.textItems[targetItemId].domishObjects
    const characterCount = DomishObject.countCharacters(focusedItemDomishObjects)
    if (selection.focusDistance === characterCount && selection.anchorDistance === characterCount) {
      // キャレットが末尾にあるなら

      const belowItemPath = CurrentState.findBelowItemPath(targetItemPath)
      // 一番下のアイテムなら何もしない
      if (belowItemPath === undefined) return

      const belowItemId = ItemPath.getItemId(belowItemPath)

      if (Internal.instance.state.items[belowItemId].itemType !== ItemType.TEXT) {
        // 下のアイテムがテキストアイテム以外の場合
        // TODO: アイテム削除コマンドを実行するのがいいと思う
      } else {
        // ターゲットアイテムも下のアイテムもテキストアイテムの場合、テキストアイテム同士のマージを行う

        // テキストを連結
        const belowItemDomishObjects = Internal.instance.state.textItems[belowItemId].domishObjects
        // TODO: テキストノード同士が連結されないことが気がかり
        CurrentState.setTextItemDomishObjects(
          targetItemId,
          focusedItemDomishObjects.concat(belowItemDomishObjects)
        )

        // 子リストを連結するため、下のアイテムの子を全てその弟としてエッジ追加。
        // アンインデントに似ているが元のエッジを削除しない点が異なる。
        for (const childItemId of Internal.instance.state.items[belowItemId].childItemIds) {
          CurrentState.insertNextSiblingItem(belowItemPath, childItemId)
        }

        // ↑の元のエッジごと削除
        CurrentState.deleteItem(belowItemId)

        // 元のキャレット位置を維持する
        External.instance.requestSetCaretDistanceAfterRendering(
          DomishObject.countCharacters(focusedItemDomishObjects)
        )

        event.preventDefault()
        CurrentState.commit()
      }
    }
  } else {
    // ターゲットアイテムがテキストアイテム以外の場合
    // TODO: アイテム削除コマンドを実行するのがいいと思う
  }
}

/** アイテムツリー上でSpaceキーを押したときのデフォルトの挙動 */
function onSpace(event: KeyboardEvent) {
  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  const targetItemType = Internal.instance.state.items[targetItemId].itemType
  if (targetItemType === ItemType.WEB_PAGE) {
    event.preventDefault()

    // クリックしたのと同じ扱いにする
    NullaryCommand.browseTab()
    CurrentState.commit()
  }
}

function onDragOver(event: DragEvent) {
  // ドロップを動作させるために必要
  event.preventDefault()
}

function onDrop(event: DragEvent) {
  doWithErrorCapture(() => {
    if (event.dataTransfer === null) return

    const data = event.dataTransfer.getData('application/treeify')
    const draggedItemPath: ItemPath = List(JSON.parse(data))
    // エッジの付け替えを行うので、エッジが定義されない場合は何もしない
    const parentItemId = ItemPath.getParentItemId(draggedItemPath)
    if (parentItemId === undefined) return

    // 全アイテムをリスト化し、Y座標でソート
    const elements = document.getElementsByClassName('item-tree-node_content-area')
    const sortedElements = List(elements).sortBy((element) => {
      return element.getBoundingClientRect().bottom
    }) as List<HTMLElement>

    // ドロップによって挿入される箇所を線形探索
    const elementIndex = sortedElements.findIndex((element) => {
      const rect = element.getBoundingClientRect()
      const middleY = (rect.top + rect.bottom) / 2
      return middleY > event.clientY
    })
    const itemPath: ItemPath = List(JSON.parse(sortedElements.get(elementIndex)!.dataset.itemPath!))

    if (is(itemPath.take(draggedItemPath.size), draggedItemPath)) {
      // 少し分かりづらいが、上記条件を満たすときはドラッグアンドドロップ移動を認めてはならない。
      // 下記の2パターンが該当する。
      // (A) 自分自身へドロップした場合（無意味だしエッジ付け替えの都合で消えてしまうので何もしなくていい）
      // (B) 自分の子孫へドロップした場合（変な循環参照を作る危険な操作なので認めてはならない）
      return
    }

    const draggedItemId = ItemPath.getItemId(draggedItemPath)

    if (InputId.isFirstModifierKeyPressed(event)) {
      // エッジを追加する（トランスクルード）
      CurrentState.insertPrevSiblingItem(itemPath, draggedItemId)
    } else {
      // エッジを付け替える
      const edge = CurrentState.removeItemGraphEdge(parentItemId, draggedItemId)
      CurrentState.insertPrevSiblingItem(itemPath, draggedItemId, edge)
    }

    CurrentState.updateItemTimestamp(draggedItemId)
    CurrentState.commit()
  })
}

export const ItemTreeCss = css`
  :root {
    --item-tree-base-font-size: 16px;

    /*
    アイテムツリーのテキスト全般に適用されるline-height。
    階層が深くなるごとにフォントサイズなどが小さくなる仕組みを実現するために比率で指定しなければならない。
    */
    --item-tree-line-height: 1.45;
    /* アイテムツリー内で階層が深くなるごとにフォントサイズなどが小さくなる仕組みに用いられる乗数 */
    --item-tree-font-size-multiplicator: 99.5%;

    /* フォントサイズをline-height（比率指定）を乗算して、行の高さを算出する */
    --item-tree-calculated-line-height: calc(
      1em * var(--item-tree-line-height) + var(--item-tree-body-area-vertical-padding)
    );
  }

  .item-tree {
    overflow-y: auto;

    font-size: var(--item-tree-base-font-size);
    line-height: var(--item-tree-line-height);

    padding-left: 15px;
    padding-top: 15px;
    /* ある程度大きめに余白をとっておかないと、下端付近でのスクロールの余裕がなくて窮屈になる */
    padding-bottom: 150px;

    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }
`
