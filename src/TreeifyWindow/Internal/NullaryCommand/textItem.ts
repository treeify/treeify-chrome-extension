import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {External} from 'src/TreeifyWindow/External/External'

/** 打ち消し線のトグルコマンド */
export function strikethroughText() {
  const textItemSelection = getTextItemSelectionFromDom()
  // キャレット自体が無い場合（非テキストアイテムがフォーカスされている場合など）は何もしない
  if (textItemSelection === undefined) return

  if (textItemSelection.anchorDistance === textItemSelection.focusDistance) {
    // テキストが選択されていない場合、
    // テキスト全体を選択してから打ち消し線トグルする。
    document.execCommand('selectAll')
    document.execCommand('strikethrough')

    // 元のキャレット位置に戻す
    External.instance.requestSelectAfterRendering(textItemSelection)
  } else {
    // テキストが選択されている場合、選択範囲を打ち消し線トグルする
    document.execCommand('strikethrough')
  }
}
