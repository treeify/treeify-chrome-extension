import {html, TemplateResult} from 'lit-html'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {ItemTreeNodeView, ItemTreeNodeViewModel} from 'src/TreeifyWindow/View/ItemTreeNodeView'

export type ItemTreeRootViewModel = {
  rootNodeViewModel: ItemTreeNodeViewModel
}

/** アイテムツリーの全体のルートView */
export function ItemTreeRootView(viewModel: ItemTreeRootViewModel): TemplateResult {
  return html`<div class="item-tree-root" @paste=${onPaste} @focusout=${onFocusOut}>
    ${ItemTreeNodeView(viewModel.rootNodeViewModel)}
  </div>`
}

// ペースト時にプレーンテキスト化する
function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain')
  document.execCommand('insertText', false, text)
}

// フォーカスが外れたらアクティブアイテムをnullにする
function onFocusOut(event: FocusEvent) {
  NextState.setActiveItemPath(null)
  NextState.commit()
}
