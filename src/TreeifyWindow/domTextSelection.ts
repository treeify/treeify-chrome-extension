import {integer} from 'src/Common/basicType'
import {TextItemSelection} from 'src/TreeifyWindow/Model/State'

export function getTextItemSelectionFromDom(): TextItemSelection | undefined {
  if (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable) {
    const selection = document.getSelection()
    if (selection === null || selection.focusNode === null || selection.anchorNode === null) {
      return undefined
    }

    const focusDistance = getDistance(
      document.activeElement,
      selection.focusNode,
      selection.focusOffset
    )
    const anchorDistance = getDistance(
      document.activeElement,
      selection.anchorNode,
      selection.anchorOffset
    )
    return {focusOffset: focusDistance, anchorOffset: anchorDistance}
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
