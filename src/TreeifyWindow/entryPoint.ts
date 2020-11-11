import {render} from 'lit-html'
import {getTextItemSelectionFromDom, setDomSelection} from 'src/TreeifyWindow/domTextSelection'
import {createRootViewModel} from 'src/TreeifyWindow/Model/createViewModel'
import {Model} from 'src/TreeifyWindow/Model/Model'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {onMessage} from 'src/TreeifyWindow/onMessage'
import {ItemTreeTextContentView} from 'src/TreeifyWindow/View/ItemTreeTextContentView'
import {RootView} from 'src/TreeifyWindow/View/RootView'

const spaRoot = document.getElementById('spa-root')!
render(RootView(createRootViewModel(Model.instance.currentState)), spaRoot)

Model.instance.addStateChangeListener((newState) => {
  // render関数を呼ぶとfocusoutイベントが発生し、focusedItemPathがnullになるケースがある。
  // なのでrender関数を呼ぶ前に取得しておく。
  const focusedItemPath = newState.focusedItemPath

  render(RootView(createRootViewModel(newState)), spaRoot)

  // キャレット位置をModelからViewに反映する
  if (newState.itemTreeTextItemSelection !== null && focusedItemPath !== null) {
    const id = ItemTreeTextContentView.domElementId(focusedItemPath)
    const contentEditable = document.getElementById(id)
    if (contentEditable !== null) {
      setDomSelection(contentEditable, newState.itemTreeTextItemSelection)
    }
  }
})

// バックグラウンドページなどからのメッセージを受信する
chrome.runtime.onMessage.addListener(onMessage)

// テキストアイテム内のキャレット位置の監視用
document.addEventListener('selectionchange', (event) => {
  NextState.setItemTreeTextItemSelection(getTextItemSelectionFromDom() ?? null)
  NextState.commitSilently()
})
