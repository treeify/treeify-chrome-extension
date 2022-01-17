import { ItemType } from 'src/TreeifyTab/basicType'
import { getTextItemSelectionFromDom } from 'src/TreeifyTab/External/domTextSelection'
import { Command } from 'src/TreeifyTab/Internal/Command/index'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import { assertNonUndefined } from 'src/Utility/Debug/assert'

export function createTextItem() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const newItemId = CurrentState.createTextItem()
  const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)
  // 作った項目をフォーカスする
  CurrentState.setTargetItemPath(newItemPath)
  Rerenderer.instance.requestToFocusTargetItem()
}

/** 太字のトグルコマンド */
export function toggleBold() {
  execTextEditCommand('bold')
}

/** 下線のトグルコマンド */
export function toggleUnderline() {
  execTextEditCommand('underline')
}

/** イタリック体のトグルコマンド */
export function toggleItalic() {
  execTextEditCommand('italic')
}

/** 打ち消し線のトグルコマンド */
export function toggleStrikethrough() {
  execTextEditCommand('strikethrough')
}

// テキスト選択範囲に太字や打ち消し線などのテキスト修飾を行う
function execTextEditCommand(commandName: string) {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  if (selectedItemPaths.length > 1) {
    // 複数選択中は各テキスト項目のテキストを全選択してexecCommandする

    for (const selectedItemPath of selectedItemPaths) {
      const itemId = ItemPath.getItemId(selectedItemPath)
      if (Internal.instance.state.items[itemId].type !== ItemType.TEXT) continue

      const targetElementId = MainAreaContentView.focusableDomElementId(selectedItemPath)
      const focusableElement = document.getElementById(targetElementId)
      if (focusableElement !== null) {
        focusableElement.focus({ preventScroll: true })
        document.execCommand('selectAll')
        document.execCommand(commandName)
      }
    }

    // フォーカスを元に戻す
    Rerenderer.instance.requestToFocusTargetItem()
  } else {
    const textItemSelection = getTextItemSelectionFromDom()
    // キャレット自体が無い場合（非テキスト項目がフォーカスされている場合など）は何もしない
    if (textItemSelection === undefined) return

    if (textItemSelection.anchorDistance === textItemSelection.focusDistance) {
      // テキストが選択されていない場合、テキスト全体を選択してから実行する
      document.execCommand('selectAll')
      document.execCommand(commandName)

      // 元のキャレット位置に戻す
      Rerenderer.instance.requestToFocusTargetItem(textItemSelection)
    } else {
      document.execCommand(commandName)
    }
  }
}

/** contenteditableな要素で改行を実行する */
export function insertNewline() {
  const itemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  if (Internal.instance.state.items[itemId].type === ItemType.TEXT) {
    document.execCommand('insertLineBreak')
  } else {
    Command.createTextItem()
  }
}

/**
 * 選択した項目をグルーピングする。
 * 具体的には新しい空のテキスト項目を作り、選択された項目をその子リストに移動する。
 */
export function grouping() {
  if (!ItemPath.hasParent(CurrentState.getTargetItemPath())) {
    // アクティブページの親を作るわけにはいかないので何もしない
    return
  }

  // 空のテキスト項目を作って配置する
  const newItemId = CurrentState.createTextItem()
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const newItemPath = CurrentState.insertPrevSiblingItem(selectedItemPaths[0], newItemId)

  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    CurrentState.throwIfCantInsertChildItem(newItemId)(selectedItemId)
  }

  // 選択された項目を移動する
  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    const parentItemId = ItemPath.getParentItemId(selectedItemPath)
    assertNonUndefined(parentItemId)
    const edge = CurrentState.removeItemGraphEdge(parentItemId, selectedItemId)

    CurrentState.insertLastChildItem(newItemId, selectedItemId, edge)
  }

  CurrentState.setTargetItemPath(newItemPath)
  Rerenderer.instance.requestToFocusTargetItem()
}

export function convertSpaceToNewline() {
  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  if (Internal.instance.state.items[targetItemId].type !== ItemType.TEXT) {
    return
  }

  const domishObjects = Internal.instance.state.textItems[targetItemId].domishObjects
  CurrentState.setTextItemDomishObjects(
    targetItemId,
    DomishObject.convertSpaceToNewline(domishObjects)
  )
  CurrentState.updateItemTimestamp(targetItemId)
}
