import {integer} from 'src/Common/basicType'

/**
 * contenteditableな要素の先頭から現在のfocusまでの文字数を取得する。
 * 改行も1文字としてカウントする。
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
 * 改行も1文字としてカウントする。
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
  return range.toString().length + countBrElements(range.cloneContents())
}

// Nodeに含まれるbr要素の数を返す
function countBrElements(node: Node): integer {
  if (node instanceof HTMLBRElement) {
    return 1
  }

  return Array.from(node.childNodes)
    .map(countBrElements)
    .reduce((a: integer, x) => a + x, 0)
}
