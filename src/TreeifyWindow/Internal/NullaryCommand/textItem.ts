import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {External} from 'src/TreeifyWindow/External/External'

/** 太字のトグルコマンド */
export function toggleBold() {
  const textItemSelection = getTextItemSelectionFromDom()
  // キャレット自体が無い場合（非テキストアイテムがフォーカスされている場合など）は何もしない
  if (textItemSelection === undefined) return

  if (textItemSelection.anchorDistance === textItemSelection.focusDistance) {
    // テキストが選択されていない場合、
    // テキスト全体を選択してから打ち消し線トグルする。
    document.execCommand('selectAll')
    document.execCommand('bold')

    // 元のキャレット位置に戻す
    External.instance.requestSelectAfterRendering(textItemSelection)
  } else {
    document.execCommand('bold')
  }
}

/** 打ち消し線のトグルコマンド */
export function toggleStrikethrough() {
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
    document.execCommand('strikethrough')
  }
}
