import { integer } from 'src/Utility/integer'

/** テキスト項目のcontenteditableにおけるキャレット位置やテキスト選択範囲を表す型 */
export type TextItemSelection = {
  /**
   * getSelectionで取得できるfocusNode&focusOffsetの位置を表す値。
   * contenteditableな要素の先頭からfocus位置までの文字数（改行を含む）。
   */
  focusDistance: integer
  /**
   * getSelectionで取得できるanchorNode&anchorOffsetの位置を表す値。
   * contenteditableな要素の先頭からanchor位置までの文字数（改行を含む）。
   */
  anchorDistance: integer
}

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
    return { focusDistance, anchorDistance }
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
export function countBrElements(node: Node): integer {
  if (node instanceof HTMLBRElement) {
    return 1
  }

  return Array.from(node.childNodes)
    .map(countBrElements)
    .reduce((a: integer, x) => a + x, 0)
}

/** {@link getDistance}で算出された距離をDOMのoffsetに変換する */
function convertToDomOffset(node: Node, distance: integer): { node: Node; offset: integer } {
  if (distance === 0) {
    return { node, offset: 0 }
  }

  // 改行直後の行頭を指しているケース
  if (node instanceof HTMLBRElement && distance === 1) {
    if (node.nextSibling === null) {
      return { node, offset: 0 }
    } else {
      return { node: node.nextSibling, offset: 0 }
    }
  }

  const childNodes = Array.from(node.childNodes)
  // テキストノードやその他の終端ノード用
  if (childNodes.length === 0) {
    return { node, offset: distance }
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
  if (contentEditable instanceof HTMLElement && contentEditable.isContentEditable) {
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
 * メインエリア自体をフォーカスする。
 * これはメインエリア内のいずれの項目もフォーカスせず、
 * それでいてメインエリアに対するキーボード操作を可能とするために用いられる。
 * 具体的には複数選択時にこの関数が用いられる。
 */
export function focusMainAreaBackground() {
  const mainArea = document.querySelector<HTMLElement>('.main-area')
  mainArea?.focus()
  // focusだけでなくselectionも設定しないとcopyイベント等が発行されない
  if (mainArea instanceof Node) {
    getSelection()?.setPosition(mainArea)
  }
}
