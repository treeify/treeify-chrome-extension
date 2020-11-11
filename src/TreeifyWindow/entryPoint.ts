import {render} from 'lit-html'
import {integer} from 'src/Common/basicType'
import {createRootViewModel} from 'src/TreeifyWindow/Model/createViewModel'
import {Model} from 'src/TreeifyWindow/Model/Model'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {onMessage} from 'src/TreeifyWindow/onMessage'
import {RootView} from 'src/TreeifyWindow/View/RootView'

const spaRoot = document.getElementById('spa-root')!
render(RootView(createRootViewModel(Model.instance.currentState)), spaRoot)

Model.instance.addStateChangeListener((newState) => {
  render(RootView(createRootViewModel(newState)), spaRoot)
})

// バックグラウンドページなどからのメッセージを受信する
chrome.runtime.onMessage.addListener(onMessage)

// テキストアイテム内のキャレット位置の監視用
document.addEventListener('selectionchange', (event) => {
  const focusOffset = getFocusOffset()
  const anchorOffset = getAnchorOffset()
  if (focusOffset === undefined || anchorOffset === undefined) {
    NextState.setItemTreeTextItemSelection(null)
    NextState.commitSilently()
    return
  }

  NextState.setItemTreeTextItemSelection({
    focusOffset,
    anchorOffset,
  })
  NextState.commitSilently()
})

/**
 * contenteditableな要素の先頭から現在のfocusまでの文字数を取得する。
 * 改行は1文字としてカウントしない。空白はカウントする。
 * ※改行をカウントしないので、n行目の行末とn+1行目の行頭が同じ戻り値になる点に注意
 */
function getFocusOffset(): integer | undefined {
  if (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable) {
    const selection = document.getSelection()
    if (selection === null || selection.focusNode === null) return undefined

    return distance(document.activeElement, selection.focusNode, selection.focusOffset)
  } else {
    return undefined
  }
}

/**
 * contenteditableな要素の先頭から現在のanchorまでの文字数を取得する。
 * 改行は1文字としてカウントしない。空白はカウントする。
 * ※改行をカウントしないので、n行目の行末とn+1行目の行頭が同じ戻り値になる点に注意
 */
function getAnchorOffset(): integer | undefined {
  if (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable) {
    const selection = document.getSelection()
    if (selection === null || selection.anchorNode === null) return undefined

    return distance(document.activeElement, selection.anchorNode, selection.anchorOffset)
  } else {
    return undefined
  }
}

function distance(node: Node, targetNode: Node, targetOffset: integer = 0): integer {
  const range = document.createRange()
  range.setStart(node, 0)
  range.setEnd(targetNode, targetOffset)
  return range.toString().length
}
