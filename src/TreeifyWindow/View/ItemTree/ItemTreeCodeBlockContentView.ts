import hljs from 'highlight.js'
import {List} from 'immutable'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {createDivElement, createElement} from 'src/TreeifyWindow/View/createElement'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {LabelView} from 'src/TreeifyWindow/View/LabelView'
import {get} from 'svelte/store'

export type ItemTreeCodeBlockContentViewModel = {
  itemPath: ItemPath
  labels: List<string>
  itemType: ItemType.CODE_BLOCK
  code: string
  language: string
  onFocus: (event: FocusEvent) => void
  onClick: (event: Event) => void
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
    code: get(codeBlockItem.code),
    language: get(codeBlockItem.language),
    onFocus: (event) => {
      doWithErrorCapture(() => {
        // focusだけでなくselectionも設定しておかないとcopyイベント等が発行されない
        if (event.target instanceof Node) {
          getSelection()?.setPosition(event.target)
        }
      })
    },
    onClick: (event) => {
      doWithErrorCapture(() => {
        CurrentState.setTargetItemPath(itemPath)
        CurrentState.commit()
      })
    },
  }
}

/** コードブロックアイテムのコンテンツ領域のView */
export function ItemTreeCodeBlockContentView(viewModel: ItemTreeCodeBlockContentViewModel) {
  const id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)
  return createDivElement(
    {class: 'item-tree-code-block-content', id, tabindex: '0'},
    {focus: viewModel.onFocus, click: viewModel.onClick},
    [
      !viewModel.labels.isEmpty()
        ? createDivElement(
            'item-tree-code-block-content_labels',
            {},
            viewModel.labels.map((label) => LabelView({text: label}))
          )
        : undefined,
      createElement('pre', {}, {}, [
        createElement('code', {}, {}, getHighlightedHtml(viewModel.code, viewModel.language)),
      ]),
    ]
  )
}

function getHighlightedHtml(code: string, language: string): string {
  // ライブラリが対応していない言語の場合例外が投げられる
  try {
    const highlightResult = hljs.highlight(code, {
      ignoreIllegals: true,
      language,
    })
    return highlightResult.value
  } catch {
    return code
  }
}
