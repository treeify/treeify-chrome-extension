import {integer, ItemId, TabId} from 'src/Common/basicType'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {List} from 'immutable'
import {render as renderWithLitHtml} from 'lit-html'
import {createRootViewModel, RootView} from 'src/TreeifyWindow/View/RootView'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {setDomSelection} from 'src/TreeifyWindow/External/domTextSelection'
import {State} from 'src/TreeifyWindow/Internal/State'
import Tab = chrome.tabs.Tab

/** TODO: コメント */
export namespace External {
  /** データベースファイル */
  export let databaseFileHandle: FileSystemFileHandle | undefined

  /** タブIDからアイテムIDへのMap */
  export const tabIdToItemId = new Map<TabId, ItemId>()
  /** アイテムIDからタブIDへのMap */
  export const itemIdToTabId = new Map<ItemId, TabId>()
  /** タブIDからTabオブジェクトへのMap */
  export const tabIdToTab = new Map<TabId, Tab>()

  /** 既存のウェブページアイテムに対応するタブを開いた際、タブ作成イベントリスナーでアイテムIDと紐付けるためのMap */
  export const urlToItemIdsForTabCreation = new Map<string, List<ItemId>>()

  /**
   * ハードアンロードによってタブを閉じられる途中のタブIDの集合。
   * chrome.tabs.onRemovedイベント時に、タブがアンロード由来で閉じられたのかを判定するために用いる。
   */
  export const hardUnloadedTabIds = new Set<integer>()

  /** タブIDとアイテムIDを結びつける */
  export function tieTabAndItem(tabId: TabId, itemId: ItemId) {
    tabIdToItemId.set(tabId, itemId)
    itemIdToTabId.set(itemId, tabId)
  }

  /** タブIDとアイテムIDの結びつけを解除する */
  export function untieTabAndItemByTabId(tabId: TabId) {
    const itemId = tabIdToItemId.get(tabId)
    assertNonUndefined(itemId)
    itemIdToTabId.delete(itemId)
    tabIdToItemId.delete(tabId)
  }

  /** DOMの初回描画を行う */
  export function render(state: State) {
    const spaRoot = document.getElementById('spa-root')!
    renderWithLitHtml(RootView(createRootViewModel(state)), spaRoot)
  }

  /** DOMを再描画する */
  export function rerender(newState: State) {
    const spaRoot = document.getElementById('spa-root')!

    // render関数を呼ぶとfocusoutイベントが発生し、focusedItemPathがnullになるケースがある。
    // なのでrender関数を呼ぶ前に取得しておく。
    const focusedItemPath = newState.pages[newState.activePageId].focusedItemPath

    renderWithLitHtml(RootView(createRootViewModel(newState)), spaRoot)

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

    // データベースファイル書き出し
    External.databaseFileHandle?.createWritable()?.then((stream) => {
      stream.write(State.toJsonString(newState))
      stream.close()
    })
  }
}
