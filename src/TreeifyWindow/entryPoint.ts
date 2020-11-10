import {render} from 'lit-html'
import {getAnchorOffset, getFocusOffset} from 'src/TreeifyWindow/domTextSelection'
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
