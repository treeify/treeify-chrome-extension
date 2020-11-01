import {List} from 'immutable'
import {html, TemplateResult} from 'lit-html'
import {guard} from 'lit-html/directives/guard'
import {ItemType} from 'src/Common/basicType'
import {DomishObject} from 'src/Common/DomishObject'

export type ItemTreeTextContentViewModel = {
  itemType: ItemType.TEXT
  domishObjects: List<DomishObject>
  onInput: (event: InputEvent) => void
  onFocus: (event: FocusEvent) => void
}

/** テキストアイテムのコンテンツ領域のView */
export function ItemTreeTextContentView(viewModel: ItemTreeTextContentViewModel): TemplateResult {
  // 描画を初回のみにするためにguardディレクティブを応用する。
  // こうすることでModel内のdomishObjectsが更新されてもinnerHTMLを再描画しなくなる。
  // こうした理由はlit-htmlが謎のクラッシュを起こしていたこと。ついでに装飾時のキャレット位置のリセットも防げる。
  const guarded = guard(true, () => DomishObject.toTemplateResult(viewModel.domishObjects))

  // ↓innerHTMLに空白テキストノードが入るとキャレット位置の計算が難しくなるのでその対策
  // prettier-ignore
  return html`<div
    class="item-tree-text-content"
    contenteditable
    @input=${viewModel.onInput}
    @focus=${viewModel.onFocus}
  >${guarded}</div>`
}
