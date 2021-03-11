import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {integer, ItemId, ItemType} from 'src/Common/basicType'
import {assertNonNull} from 'src/Common/Debug/assert'
import {DomishObject} from 'src/Common/DomishObject'
import {countBrElements, getCaretLineNumber} from 'src/TreeifyWindow/External/domTextSelection'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createItemTreeNodeViewModel,
  ItemTreeNodeView,
  ItemTreeNodeViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeNodeView'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {External} from 'src/TreeifyWindow/External/External'

export type ItemTreeViewModel = {
  rootNodeViewModel: ItemTreeNodeViewModel
}

export function createItemTreeViewModel(state: State): ItemTreeViewModel {
  const rootItemPath = new ItemPath(List.of(state.activePageId))

  const allDisplayingItemIds = [...getAllDisplayingItemIds(state, state.activePageId)]
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
 * ただし（アンフォールドなどの理由で）表示されないアイテムはスキップする。
 */
function* getAllDisplayingItemIds(state: State, itemId: ItemId): Generator<ItemId> {
  yield itemId
  for (const childItemId of NextState.getDisplayingChildItemIds(itemId)) {
    yield* getAllDisplayingItemIds(state, childItemId)
  }
}

/** アイテムツリーの全体のルートView */
export function ItemTreeView(viewModel: ItemTreeViewModel): TemplateResult {
  return html`<main class="item-tree" @paste=${onPaste} @keydown=${onKeyDown}>
    ${ItemTreeNodeView(viewModel.rootNodeViewModel)}
  </main>`
}

function onKeyDown(event: KeyboardEvent) {
  // IME入力中やIME確定時（特にEnterキー）はTreeifyの処理が暴発しないようにする。
  // 参考：https://qiita.com/ledsun/items/31e43a97413dd3c8e38e
  if (event.isComposing) return

  const inputId = InputId.fromKeyboardEvent(event)
  switch (inputId) {
    case '0000ArrowLeft':
      onArrowLeft(event)
      break
    case '0000ArrowRight':
      onArrowRight(event)
      break
    case '0000ArrowUp':
      onArrowUp(event)
      break
    case '0000ArrowDown':
      onArrowDown(event)
      break
    case '0000Backspace':
      onBackspace(event)
      break
    case '0000Delete':
      onDelete(event)
      break
  }

  const command = NextState.getItemTreeCommand(inputId)
  if (command !== undefined) {
    event.preventDefault()
    command.execute()
    NextState.commit()
  }
}

/**
 * ←キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowLeft(event: KeyboardEvent) {
  const targetItemPath = NextState.getTargetItemPath()
  if (targetItemPath === null) return

  const aboveItemPath = NextState.findAboveItemPath(targetItemPath)
  // 上のアイテムが存在しない場合はブラウザの挙動に任せる
  if (aboveItemPath === undefined) return

  const textItemSelection = NextState.getItemTreeTextItemSelection()
  if (textItemSelection === null) {
    // ターゲットアイテムが非テキストアイテムだと断定する

    const aboveItemType = NextState.getItemType(aboveItemPath.itemId)
    if (aboveItemType === ItemType.TEXT) {
      // 上のアイテムがテキストアイテムの場合、キャレットをその末尾に移動する
      event.preventDefault()
      const domishObjects = NextState.getTextItemDomishObjects(aboveItemPath.itemId)
      const characterCount = DomishObject.countCharacters(domishObjects)
      NextState.setItemTreeTextItemCaretDistance(characterCount)
      NextState.setTargetItemPath(aboveItemPath)
      External.requestFocusAfterRendering(ItemTreeContentView.focusableDomElementId(aboveItemPath))
      NextState.commit()
    } else {
      // 上のアイテムがテキストアイテム以外の場合、それをターゲットアイテムにする
      event.preventDefault()
      NextState.setTargetItemPath(aboveItemPath)
      External.requestFocusAfterRendering(ItemTreeContentView.focusableDomElementId(aboveItemPath))
      NextState.commit()
    }
  } else {
    // キャレット位置が先頭以外のときはブラウザの挙動に任せる
    if (textItemSelection.focusDistance > 0 || textItemSelection.anchorDistance > 0) {
      return
    }

    const aboveItemType = NextState.getItemType(aboveItemPath.itemId)
    if (aboveItemType === ItemType.TEXT) {
      // 上のアイテムがテキストアイテムの場合、キャレットをその末尾に移動する
      event.preventDefault()
      const domishObjects = NextState.getTextItemDomishObjects(aboveItemPath.itemId)
      const characterCount = DomishObject.countCharacters(domishObjects)
      NextState.setItemTreeTextItemCaretDistance(characterCount)
      NextState.setTargetItemPath(aboveItemPath)
      External.requestFocusAfterRendering(ItemTreeContentView.focusableDomElementId(aboveItemPath))
      NextState.commit()
    } else {
      // 上のアイテムがテキストアイテム以外の場合、それをターゲットアイテムにする
      event.preventDefault()
      NextState.setItemTreeTextItemSelection(null)
      NextState.setTargetItemPath(aboveItemPath)
      External.requestFocusAfterRendering(ItemTreeContentView.focusableDomElementId(aboveItemPath))
      NextState.commit()
    }
  }
}

/**
 * →キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowRight(event: KeyboardEvent) {
  const targetItemPath = NextState.getTargetItemPath()
  assertNonNull(targetItemPath)

  const belowItemPath = NextState.findBelowItemPath(targetItemPath)
  // 下のアイテムが存在しない場合はブラウザの挙動に任せる
  if (belowItemPath === undefined) return

  const textItemSelection = NextState.getItemTreeTextItemSelection()
  if (textItemSelection === null) {
    // ターゲットアイテムが非テキストアイテムだと断定する

    const belowItemType = NextState.getItemType(belowItemPath.itemId)
    if (belowItemType === ItemType.TEXT) {
      // 下のアイテムがテキストアイテムの場合、キャレットをその先頭に移動する
      event.preventDefault()
      NextState.setItemTreeTextItemCaretDistance(0)
      NextState.setTargetItemPath(belowItemPath)
      External.requestFocusAfterRendering(ItemTreeContentView.focusableDomElementId(belowItemPath))
      NextState.commit()
    } else {
      // 下のアイテムがテキストアイテム以外の場合、それをターゲットアイテムにする
      event.preventDefault()
      NextState.setTargetItemPath(belowItemPath)
      External.requestFocusAfterRendering(ItemTreeContentView.focusableDomElementId(belowItemPath))
      NextState.commit()
    }
  } else {
    const domishObjects = NextState.getTextItemDomishObjects(targetItemPath.itemId)
    const characterCount = DomishObject.countCharacters(domishObjects)

    // キャレット位置が末尾以外のときはブラウザの挙動に任せる
    if (
      textItemSelection.focusDistance < characterCount ||
      textItemSelection.anchorDistance < characterCount
    ) {
      return
    }

    const belowItemType = NextState.getItemType(belowItemPath.itemId)
    if (belowItemType === ItemType.TEXT) {
      // 下のアイテムがテキストアイテムの場合、キャレットをその先頭に移動する
      event.preventDefault()
      NextState.setItemTreeTextItemCaretDistance(0)
      NextState.setTargetItemPath(belowItemPath)
      External.requestFocusAfterRendering(ItemTreeContentView.focusableDomElementId(belowItemPath))
      NextState.commit()
    } else {
      // 下のアイテムがテキストアイテム以外の場合、それをターゲットアイテムにする
      event.preventDefault()
      NextState.setItemTreeTextItemSelection(null)
      NextState.setTargetItemPath(belowItemPath)
      External.requestFocusAfterRendering(ItemTreeContentView.focusableDomElementId(belowItemPath))
      NextState.commit()
    }
  }
}

/**
 * ↑キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowUp(event: KeyboardEvent) {
  const targetItemPath = NextState.getTargetItemPath()
  assertNonNull(targetItemPath)

  const aboveItemPath = NextState.findAboveItemPath(targetItemPath)
  // 上のアイテムが存在しない場合はブラウザの挙動に任せる
  if (aboveItemPath === undefined) return

  if (NextState.getItemType(targetItemPath.itemId) === ItemType.TEXT) {
    // ターゲットアイテムがテキストアイテムの場合

    const caretLineNumber = getCaretLineNumber()
    // キャレットが最初の行以外にいるときはブラウザの挙動に任せる
    if (caretLineNumber === undefined || caretLineNumber > 0) {
      return
    }
  }

  event.preventDefault()
  moveFocusToAboveItem(aboveItemPath)
}

function moveFocusToAboveItem(aboveItemPath: ItemPath) {
  if (NextState.getItemType(aboveItemPath.itemId) === ItemType.TEXT) {
    // 上のアイテムがテキストアイテムの場合、キャレットをその末尾に移動する
    const domishObjects = NextState.getTextItemDomishObjects(aboveItemPath.itemId)
    NextState.setItemTreeTextItemCaretDistance(DomishObject.countCharacters(domishObjects))
  } else {
    // 上のアイテムがテキストアイテム以外の場合、上のアイテムをターゲットアイテムにする
    NextState.setItemTreeTextItemSelection(null)
  }

  NextState.setTargetItemPath(aboveItemPath)
  External.requestFocusAfterRendering(ItemTreeContentView.focusableDomElementId(aboveItemPath))
  NextState.commit()
}

/**
 * ↓キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowDown(event: KeyboardEvent) {
  const targetItemPath = NextState.getTargetItemPath()
  assertNonNull(targetItemPath)

  const belowItemPath = NextState.findBelowItemPath(targetItemPath)
  // 下のアイテムが存在しない場合はブラウザの挙動に任せる
  if (belowItemPath === undefined) return

  if (NextState.getItemType(targetItemPath.itemId) === ItemType.TEXT) {
    // ターゲットアイテムがテキストアイテムの場合

    const caretLineNumber = getCaretLineNumber()
    assertNonNull(document.activeElement)
    const brElementCount = countBrElements(document.activeElement)
    // キャレットが最初の行以外にいるときはブラウザの挙動に任せる
    if (
      caretLineNumber === undefined ||
      brElementCount === undefined ||
      caretLineNumber < brElementCount
    ) {
      return
    }
  }

  event.preventDefault()
  moveFocusToBelowItem(belowItemPath)
}

function moveFocusToBelowItem(belowItemPath: ItemPath) {
  if (NextState.getItemType(belowItemPath.itemId) === ItemType.TEXT) {
    // 下のアイテムがテキストアイテムの場合、キャレットをその先頭に移動する
    NextState.setItemTreeTextItemCaretDistance(0)
  } else {
    // 下のアイテムがテキストアイテム以外の場合、上のアイテムをターゲットアイテムにする
    NextState.setItemTreeTextItemSelection(null)
  }
  NextState.setTargetItemPath(belowItemPath)
  External.requestFocusAfterRendering(ItemTreeContentView.focusableDomElementId(belowItemPath))
  NextState.commit()
}

/** アイテムツリー上でBackspaceキーを押したときのデフォルトの挙動 */
function onBackspace(event: KeyboardEvent) {
  const targetItemPath = NextState.getTargetItemPath()
  assertNonNull(targetItemPath)

  if (NextState.getItemType(targetItemPath.itemId) === ItemType.TEXT) {
    // ターゲットアイテムがテキストアイテムの場合

    const selection = NextState.getItemTreeTextItemSelection()
    assertNonNull(selection)
    if (selection.focusDistance === 0 && selection.anchorDistance === 0) {
      // キャレットが先頭にあるなら

      const aboveItemPath = NextState.findAboveItemPath(targetItemPath)
      // アクティブアイテムなら何もしない
      if (aboveItemPath === undefined) return

      if (NextState.getItemType(aboveItemPath.itemId) !== ItemType.TEXT) {
        // 上のアイテムがテキストアイテム以外の場合
        // TODO: アイテム削除コマンドを実行するのがいいと思う
      } else {
        // ターゲットアイテムも上のアイテムもテキストアイテムの場合、テキストアイテム同士のマージを行う

        // テキストを連結
        const focusedItemDomishObjects = NextState.getTextItemDomishObjects(targetItemPath.itemId)
        const aboveItemDomishObjects = NextState.getTextItemDomishObjects(aboveItemPath.itemId)
        // TODO: テキストノード同士が連結されないことが気がかり
        NextState.setTextItemDomishObjects(
          aboveItemPath.itemId,
          aboveItemDomishObjects.concat(focusedItemDomishObjects)
        )

        // 子リストを連結するため、子を全て弟としてエッジ追加。
        // アンインデントに似ているが元のエッジを削除しない点が異なる。
        for (const childItemId of NextState.getChildItemIds(targetItemPath.itemId)) {
          NextState.insertNextSiblingItem(targetItemPath, childItemId)
        }

        // ↑の元のエッジごと削除
        NextState.deleteItem(targetItemPath.itemId)

        // 上のアイテムの元の末尾にキャレットを移動する
        NextState.setTargetItemPath(aboveItemPath)
        External.requestFocusAfterRendering(
          ItemTreeContentView.focusableDomElementId(aboveItemPath)
        )
        NextState.setItemTreeTextItemCaretDistance(
          DomishObject.countCharacters(aboveItemDomishObjects)
        )

        event.preventDefault()
        NextState.commit()
      }
    }
  } else {
    // ターゲットアイテムがテキストアイテム以外の場合
    // TODO: アイテム削除コマンドを実行するのがいいと思う
  }
}

/** アイテムツリー上でDeleteキーを押したときのデフォルトの挙動 */
function onDelete(event: KeyboardEvent) {
  const targetItemPath = NextState.getTargetItemPath()
  assertNonNull(targetItemPath)

  if (NextState.getItemType(targetItemPath.itemId) === ItemType.TEXT) {
    // ターゲットアイテムがテキストアイテムの場合

    const selection = NextState.getItemTreeTextItemSelection()
    assertNonNull(selection)

    const focusedItemDomishObjects = NextState.getTextItemDomishObjects(targetItemPath.itemId)
    const characterCount = DomishObject.countCharacters(focusedItemDomishObjects)
    if (selection.focusDistance === characterCount && selection.anchorDistance === characterCount) {
      // キャレットが末尾にあるなら

      const belowItemPath = NextState.findBelowItemPath(targetItemPath)
      // 一番下のアイテムなら何もしない
      if (belowItemPath === undefined) return

      if (NextState.getItemType(belowItemPath.itemId) !== ItemType.TEXT) {
        // 下のアイテムがテキストアイテム以外の場合
        // TODO: アイテム削除コマンドを実行するのがいいと思う
      } else {
        // ターゲットアイテムも下のアイテムもテキストアイテムの場合、テキストアイテム同士のマージを行う

        // テキストを連結
        const belowItemDomishObjects = NextState.getTextItemDomishObjects(belowItemPath.itemId)
        // TODO: テキストノード同士が連結されないことが気がかり
        NextState.setTextItemDomishObjects(
          targetItemPath.itemId,
          focusedItemDomishObjects.concat(belowItemDomishObjects)
        )

        // 子リストを連結するため、下のアイテムの子を全てその弟としてエッジ追加。
        // アンインデントに似ているが元のエッジを削除しない点が異なる。
        for (const childItemId of NextState.getChildItemIds(belowItemPath.itemId)) {
          NextState.insertNextSiblingItem(belowItemPath, childItemId)
        }

        // ↑の元のエッジごと削除
        NextState.deleteItem(belowItemPath.itemId)

        event.preventDefault()
        NextState.commit()
      }
    }
  } else {
    // ターゲットアイテムがテキストアイテム以外の場合
    // TODO: アイテム削除コマンドを実行するのがいいと思う
  }
}

// ペースト時にプレーンテキスト化する
function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain')
  document.execCommand('insertText', false, text)
}
