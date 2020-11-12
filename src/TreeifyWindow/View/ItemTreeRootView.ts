import {html, TemplateResult} from 'lit-html'
import {ItemType} from 'src/Common/basicType'
import {assertNonNull} from 'src/Common/Debug/assert'
import {DomishObject} from 'src/Common/DomishObject'
import {InputId} from 'src/TreeifyWindow/Model/InputId'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {ItemTreeNodeView, ItemTreeNodeViewModel} from 'src/TreeifyWindow/View/ItemTreeNodeView'

export type ItemTreeRootViewModel = {
  rootNodeViewModel: ItemTreeNodeViewModel
}

/** アイテムツリーの全体のルートView */
export function ItemTreeRootView(viewModel: ItemTreeRootViewModel): TemplateResult {
  return html`<div
    class="item-tree-root"
    @paste=${onPaste}
    @focusout=${onFocusOut}
    @keydown=${onKeyDown}
  >
    ${ItemTreeNodeView(viewModel.rootNodeViewModel)}
  </div>`
}

function onKeyDown(event: KeyboardEvent) {
  const inputId = InputId.fromKeyboardEvent(event)
  switch (inputId) {
    case '0000ArrowLeft':
      onArrowLeft(event)
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
 * ←キー押下時の処理
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
