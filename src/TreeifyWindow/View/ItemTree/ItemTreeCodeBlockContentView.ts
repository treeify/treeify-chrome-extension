import {html, TemplateResult} from 'lit-html'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {css} from 'src/TreeifyWindow/View/css'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'

export type ItemTreeCodeBlockContentViewModel = {
  itemPath: ItemPath
  itemType: ItemType.CODE_BLOCK
  code: string
  onFocus: (event: FocusEvent) => void
}

export function createItemTreeCodeBlockContentViewModel(
  state: State,
  itemPath: ItemPath
): ItemTreeCodeBlockContentViewModel {
  const itemId = ItemPath.getItemId(itemPath)

  return {
    itemPath,
    itemType: ItemType.CODE_BLOCK,
    code: state.codeBlockItems[itemId].code,
    onFocus: (event) => {
      doWithErrorCapture(() => {
        CurrentState.setTargetItemPath(itemPath)
        CurrentState.commit()
      })
    },
  }
}

/** コードブロックアイテムのコンテンツ領域のView */
export function ItemTreeCodeBlockContentView(
  viewModel: ItemTreeCodeBlockContentViewModel
): TemplateResult {
  const id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)
  return html`<div
    class="item-tree-code-block-content"
    id=${id}
    tabindex="0"
    @focus=${viewModel.onFocus}
  >
    <pre><code>${viewModel.code}</code></pre>
  </div>`
}

export const ItemTreeCodeBlockContentCss = css`
  /* コードブロックアイテムのコンテンツ領域のルート */
  .item-tree-code-block-content {
    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }
`
