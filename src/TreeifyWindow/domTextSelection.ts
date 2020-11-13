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
    return {focusDistance, anchorDistance}
  } else {
    return undefined
  }
}

/**
 * 2つのNode間の距離を計算する。
 * ここでいう距離の定義は「テキストの文字数 + br要素数」である。
 * 例えば次の状況におけるdiv要素からi要素の先頭(offset0)までの距離は4となる。
 * <div>
 *   abc
 *   <br>
 *   <i>xyz</i>
 * </div>
 */
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

/** {@link getDistance}で算出された距離をDOMのoffsetに変換する */
function convertToDomOffset(node: Node, distance: integer): {node: Node; offset: integer} {
  if (distance === 0) {
    return {node, offset: 0}
  }

  // 改行直後の行頭を指しているケース
  if (node instanceof HTMLBRElement && distance === 1) {
    if (node.nextSibling === null) {
      return {node, offset: 0}
    } else {
      return {node: node.nextSibling, offset: 0}
    }
  }

  const childNodes = Array.from(node.childNodes)
  // テキストノードやその他の終端ノード用
  if (childNodes.length === 0) {
    return {node, offset: distance}
  }

  // トップダウンにターゲットNodeを探す
  let remainingDistance = distance
  for (const childNode of childNodes) {
    const characterCount = getCharacterCount(childNode)
    if (characterCount >= remainingDistance) {
      return convertToDomOffset(childNode, remainingDistance)
    }
    remainingDistance -= characterCount
  }
  throw Error('nodeのサイズを超えるdistanceが指定された')
}

/** DOMのテキスト選択範囲(selection)を設定する */
export function setDomSelection(contentEditable: Node, textItemSelection: TextItemSelection) {
  const selection = getSelection()
  if (selection !== null) {
    const focusPosition = convertToDomOffset(contentEditable, textItemSelection.focusDistance)
    const anchorPosition = convertToDomOffset(contentEditable, textItemSelection.anchorDistance)
    selection.setBaseAndExtent(
      anchorPosition.node,
      anchorPosition.offset,
      focusPosition.node,
      focusPosition.offset
    )
  }
}

/**
 * Node内の文字数を計算する。
 * ここでいう文字数の定義は「テキストの文字数 + br要素数」である。
 * 例えば次の状況におけるdiv要素の文字数は7となる。
 * <div>
 *   abc
 *   <br>
 *   <i>xyz</i>
 * </div>
 */
function getCharacterCount(node: Node): integer {
  const range = document.createRange()
  range.selectNode(node)
  return range.toString().length + countBrElements(range.cloneContents())
}

/**
 * キャレットがある行の行番号を返す（0オリジン）。
 * テキスト選択中の動作は未定義。
 */
export function getCaretLineNumber(): integer | undefined {
  if (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable) {
    const selection = document.getSelection()
    if (selection === null) return undefined

    const range = selection.getRangeAt(0).cloneRange()
    range.setStart(document.activeElement, 0)
    return countBrElements(range.cloneContents())
  } else {
    return undefined
  }
}
