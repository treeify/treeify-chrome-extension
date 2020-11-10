import {integer} from 'src/Common/basicType'

/**
 * contenteditableな要素の先頭から現在のfocusまでの文字数を取得する。
 * 改行は1文字としてカウントしない。空白はカウントする。
 * ※改行をカウントしないので、n行目の行末とn+1行目の行頭が同じ戻り値になる点に注意
 */
export function getFocusOffset(): integer | undefined {
  if (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable) {
    const selection = document.getSelection()
    if (selection === null || selection.focusNode === null) return undefined

    return getDistance(document.activeElement, selection.focusNode, selection.focusOffset)
  } else {
    return undefined
  }
}

/**
 * contenteditableな要素の先頭から現在のanchorまでの文字数を取得する。
 * 改行は1文字としてカウントしない。空白はカウントする。
 * ※改行をカウントしないので、n行目の行末とn+1行目の行頭が同じ戻り値になる点に注意
 */
export function getAnchorOffset(): integer | undefined {
  if (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable) {
    const selection = document.getSelection()
    if (selection === null || selection.anchorNode === null) return undefined

    return getDistance(document.activeElement, selection.anchorNode, selection.anchorOffset)
  } else {
    return undefined
  }
}

function getDistance(node: Node, targetNode: Node, targetOffset: integer = 0): integer {
  const range = document.createRange()
  range.setStart(node, 0)
  range.setEnd(targetNode, targetOffset)
  return range.toString().length
}
