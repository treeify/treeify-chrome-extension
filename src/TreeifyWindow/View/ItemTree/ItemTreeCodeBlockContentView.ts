import hljs from 'highlight.js'
import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {css} from 'src/TreeifyWindow/View/css'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {LabelView} from 'src/TreeifyWindow/View/LabelView'

export type ItemTreeCodeBlockContentViewModel = {
  itemPath: ItemPath
  labels: List<string>
  itemType: ItemType.CODE_BLOCK
  code: string
  language: string
  onFocus: (event: FocusEvent) => void
}

export function createItemTreeCodeBlockContentViewModel(
  state: State,
  itemPath: ItemPath
): ItemTreeCodeBlockContentViewModel {
  const itemId = ItemPath.getItemId(itemPath)

  const codeBlockItem = state.codeBlockItems[itemId]
  return {
    itemPath,
    labels: CurrentState.getLabels(itemPath),
    itemType: ItemType.CODE_BLOCK,
    code: codeBlockItem.code,
    language: codeBlockItem.language,
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
  const highlightResult = hljs.highlight(viewModel.code, {
    ignoreIllegals: true,
    language: viewModel.language,
  })
  const id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)
  return html`<div
    class="item-tree-code-block-content"
    id=${id}
    tabindex="0"
    @focus=${viewModel.onFocus}
  >
    ${!viewModel.labels.isEmpty()
      ? html`<div class="item-tree-code-block-content_labels">
          ${viewModel.labels.map((label) => LabelView({text: label}))}
        </div>`
      : undefined}
    <pre><code .innerHTML=${highlightResult.value}></code></pre>
  </div>`
}

export const ItemTreeCodeBlockContentCss = css`
  /* コードブロックアイテムのコンテンツ領域のルート */
  .item-tree-code-block-content {
    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;

    overflow-x: auto;
  }
`
