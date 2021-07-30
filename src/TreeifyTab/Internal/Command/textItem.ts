import {assertNonUndefined} from 'src/Common/Debug/assert'
import {getTextItemSelectionFromDom} from 'src/TreeifyTab/External/domTextSelection'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export function createEmptyTextItem() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const newItemId = CurrentState.createTextItem()
  const newItemPath = CurrentState.insertBelowItem(targetItemPath, newItemId)
  // 作った項目をフォーカスする
  CurrentState.setTargetItemPath(newItemPath)
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
  const textItemSelection = getTextItemSelectionFromDom()
  // キャレット自体が無い場合（非テキスト項目がフォーカスされている場合など）は何もしない
  if (textItemSelection === undefined) return

  if (textItemSelection.anchorDistance === textItemSelection.focusDistance) {
    // テキストが選択されていない場合、テキスト全体を選択してから実行する
    document.execCommand('selectAll')
    document.execCommand(commandName)

    // 元のキャレット位置に戻す
    Rerenderer.instance.requestSelectAfterRendering(textItemSelection)
  } else {
    document.execCommand(commandName)
  }
}

/** contenteditableな要素で改行を実行する */
export function insertLineBreak() {
  document.execCommand('insertLineBreak')
}

/**
 * 選択した項目をグルーピングする。
 * 具体的には新しい空のテキスト項目を作り、選択された項目をその子リストに移動する。
 */
export function groupingItems() {
  if (!ItemPath.hasParent(CurrentState.getTargetItemPath())) {
    // アクティブページの親を作るわけにはいかないので何もしない
    return
  }

  // 空のテキスト項目を作って配置する
  const newItemId = CurrentState.createTextItem()
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const newItemPath = CurrentState.insertPrevSiblingItem(selectedItemPaths.first(), newItemId)

  // 選択された項目を移動する
  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    const parentItemId = ItemPath.getParentItemId(selectedItemPath)
    assertNonUndefined(parentItemId)
    const edge = CurrentState.removeItemGraphEdge(parentItemId, selectedItemId)

    CurrentState.insertLastChildItem(newItemId, selectedItemId, edge)
  }

  CurrentState.setTargetItemPath(newItemPath)
}
