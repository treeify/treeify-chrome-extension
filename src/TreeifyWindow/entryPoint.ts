import {render} from 'lit-html'
import {getTextItemSelectionFromDom, setDomSelection} from 'src/TreeifyWindow/domTextSelection'
import {Model} from 'src/TreeifyWindow/Model/Model'
import {NextState} from 'src/TreeifyWindow/Model/NextState'
import {
  onActivated,
  onCreated,
  onMessage,
  onRemoved,
  onUpdated,
} from 'src/TreeifyWindow/chromeEventListeners'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {createRootViewModel, RootView} from 'src/TreeifyWindow/View/RootView'

entryPoint()

async function entryPoint() {
  const spaRoot = document.getElementById('spa-root')!
  render(RootView(createRootViewModel(Model.instance.currentState)), spaRoot)

  Model.instance.addStateChangeListener((newState) => {
    // render関数を呼ぶとfocusoutイベントが発生し、focusedItemPathがnullになるケースがある。
    // なのでrender関数を呼ぶ前に取得しておく。
    const focusedItemPath = newState.pages[newState.activePageId].focusedItemPath

    render(RootView(createRootViewModel(newState)), spaRoot)

    if (focusedItemPath !== null) {
      const id = ItemTreeContentView.focusableDomElementId(focusedItemPath)
      const focusableElement = document.getElementById(id)
      if (focusableElement !== null) {
        // フォーカスアイテムが画面内に入るようスクロールする。
        // blockに'center'を指定してもなぜか中央化してくれない（原因不明）。
        focusableElement.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})

        if (newState.itemTreeTextItemSelection !== null) {
          // キャレット位置をModelからViewに反映する
          setDomSelection(focusableElement, newState.itemTreeTextItemSelection)
        } else {
          // フォーカスアイテムをModelからViewに反映する
          focusableElement.focus()
        }
      }
    }
  })

  // バックグラウンドページなどからのメッセージを受信する
  chrome.runtime.onMessage.addListener(onMessage)

  // タブイベントの監視を開始
  chrome.tabs.onCreated.addListener(onCreated)
  chrome.tabs.onUpdated.addListener(onUpdated)
  chrome.tabs.onRemoved.addListener(onRemoved)
  chrome.tabs.onActivated.addListener(onActivated)

  // テキストアイテム内のキャレット位置の監視用
  document.addEventListener('selectionchange', (event) => {
    NextState.setItemTreeTextItemSelection(getTextItemSelectionFromDom() ?? null)
    NextState.commitSilently()
  })
}
