import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {integer, ItemId, ItemType} from 'src/Common/basicType'
import {assertNonNull} from 'src/Common/Debug/assert'
import {DomishObject} from 'src/Common/DomishObject'
import {countBrElements, getCaretLineNumber} from 'src/TreeifyWindow/domTextSelection'
import {InputId} from 'src/TreeifyWindow/Model/InputId'
import {ItemPath} from 'src/TreeifyWindow/Model/ItemPath'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {State} from 'src/TreeifyWindow/Model/State'
import {
  createItemTreeNodeViewModel,
  ItemTreeNodeView,
  ItemTreeNodeViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeNodeView'

export type ItemTreeViewModel = {
  rootNodeViewModel: ItemTreeNodeViewModel
}

export function createItemTreeViewModel(state: State): ItemTreeViewModel {
  const rootItemPath = new ItemPath(List.of(state.activePageId))

  const allDisplayingItemIds = [...getAllDisplayingItemIds(state, state.activePageId)]
  // 足跡表示数を計算
  // TODO: パラメータをカスタマイズ可能にする。なおこれをCSS変数にしていいのかどうかは微妙な問題
  const footprintCount = Math.floor(Math.pow(allDisplayingItemIds.length, 0.65))

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
  return html`<main
    class="item-tree"
    @paste=${onPaste}
    @focusout=${onFocusOut}
    @keydown=${onKeyDown}
  >
    ${ItemTreeNodeView(viewModel.rootNodeViewModel)}
  </main>`
}

function onKeyDown(event: KeyboardEvent) {
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
  const textItemSelection = NextState.getItemTreeTextItemSelection()
  // テキストアイテムにフォーカスが当たっていないときは何もしない
  if (textItemSelection === null) return

  // キャレット位置が先頭以外のときはブラウザの挙動に任せる
  if (textItemSelection.focusDistance > 0 || textItemSelection.anchorDistance > 0) {
    return
  }

  const focusedItemPath = NextState.getFocusedItemPath()
  assertNonNull(focusedItemPath)

  const aboveItemPath = NextState.findAboveItemPath(focusedItemPath)
  // 上のアイテムが存在しない場合はブラウザの挙動に任せる
  if (aboveItemPath === undefined) return

  const aboveItemType = NextState.getItemType(aboveItemPath.itemId)
  if (aboveItemType === ItemType.TEXT) {
    // 上のアイテムがテキストアイテムの場合、キャレットをその末尾に移動する
    event.preventDefault()
    const domishObjects = NextState.getTextItemDomishObjects(aboveItemPath.itemId)
    const characterCount = DomishObject.countCharacters(domishObjects)
    NextState.setItemTreeTextItemCaretDistance(characterCount)
    NextState.setFocusedItemPath(aboveItemPath)
    NextState.commit()
  }
}

/**
 * →キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowRight(event: KeyboardEvent) {
  const textItemSelection = NextState.getItemTreeTextItemSelection()
  // テキストアイテムにフォーカスが当たっていないときは何もしない
  if (textItemSelection === null) return

  const focusedItemPath = NextState.getFocusedItemPath()
  assertNonNull(focusedItemPath)

  const belowItemPath = NextState.findBelowItemPath(focusedItemPath)
  // 下のアイテムが存在しない場合はブラウザの挙動に任せる
  if (belowItemPath === undefined) return

  const domishObjects = NextState.getTextItemDomishObjects(focusedItemPath.itemId)
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
    NextState.setFocusedItemPath(belowItemPath)
    NextState.commit()
  }
}

/**
 * ↑キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowUp(event: KeyboardEvent) {
  const focusedItemPath = NextState.getFocusedItemPath()
  assertNonNull(focusedItemPath)

  const aboveItemPath = NextState.findAboveItemPath(focusedItemPath)
  // 上のアイテムが存在しない場合はブラウザの挙動に任せる
  if (aboveItemPath === undefined) return

  if (NextState.getItemType(focusedItemPath.itemId) === ItemType.TEXT) {
    // フォーカスアイテムがテキストアイテムの場合

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
    // 上のアイテムがテキストアイテム以外の場合、上のアイテムをフォーカスアイテムにする
    NextState.setItemTreeTextItemSelection(null)
  }

  NextState.setFocusedItemPath(aboveItemPath)
  NextState.commit()
}

/**
 * ↓キー押下時の処理。
 * キャレット位置によってブラウザの挙動に任せるかどうか分岐する。
 */
function onArrowDown(event: KeyboardEvent) {
  const focusedItemPath = NextState.getFocusedItemPath()
  assertNonNull(focusedItemPath)

  const belowItemPath = NextState.findBelowItemPath(focusedItemPath)
  // 下のアイテムが存在しない場合はブラウザの挙動に任せる
  if (belowItemPath === undefined) return

  if (NextState.getItemType(focusedItemPath.itemId) === ItemType.TEXT) {
    // フォーカスアイテムがテキストアイテムの場合

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
    // 下のアイテムがテキストアイテム以外の場合、上のアイテムをフォーカスアイテムにする
    NextState.setItemTreeTextItemSelection(null)
  }
  NextState.setFocusedItemPath(belowItemPath)
  NextState.commit()
}

// ペースト時にプレーンテキスト化する
function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain')
  document.execCommand('insertText', false, text)
}

// フォーカスが外れたらフォーカスアイテムをnullにする
function onFocusOut(event: FocusEvent) {
  NextState.setFocusedItemPath(null)
  NextState.commitSilently()
}
