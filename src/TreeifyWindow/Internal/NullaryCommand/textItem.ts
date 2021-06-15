import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

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
  // キャレット自体が無い場合（非テキストアイテムがフォーカスされている場合など）は何もしない
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
