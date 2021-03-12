import {integer, ItemId, TabId} from 'src/Common/basicType'
import {assert, assertNonUndefined} from 'src/Common/Debug/assert'
import {List} from 'immutable'
import {render as renderWithLitHtml} from 'lit-html'
import {createRootViewModel, RootView} from 'src/TreeifyWindow/View/RootView'
import {setDomSelection} from 'src/TreeifyWindow/External/domTextSelection'
import {State} from 'src/TreeifyWindow/Internal/State'
import {TextItemDomElementCache} from 'src/TreeifyWindow/External/TextItemDomElementCache'
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
   * テキストアイテムのcontenteditableな要素のキャッシュ。
   * 【キャッシュする理由】
   * contenteditableな要素はlit-htmlで描画するのが事実上困難なので、自前でDOM要素を生成している。
   * 参考：https://github.com/Polymer/lit-html/issues/572
   * キャッシュしないと画面更新ごとに全てのcontenteditableな要素が再生成されることになり、
   * パフォーマンスへの悪影響に加えてfocusとselectionが失われる問題に対処しなければならない。
   */
  export const textItemDomElementCache = new TextItemDomElementCache()

  // 次の描画が完了した際にフォーカスすべきDOM要素のID
  let pendingFocusElementId: string | undefined

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

    renderWithLitHtml(RootView(createRootViewModel(newState)), spaRoot)

    if (pendingFocusElementId !== undefined) {
      const focusableElement = document.getElementById(pendingFocusElementId)
      if (focusableElement !== null) {
        // ターゲットアイテムが画面内に入るようスクロールする。
        // blockに'center'を指定してもなぜか中央化してくれない（原因不明）。
        focusableElement.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})

        if (newState.itemTreeTextItemSelection !== null) {
          // キャレット位置をModelからViewに反映する
          setDomSelection(focusableElement, newState.itemTreeTextItemSelection)
        } else {
          // ターゲットアイテムをModelからViewに反映する
          focusableElement.focus()
        }
      }
    }

    pendingFocusElementId = undefined

    // データベースファイル書き出し
    External.databaseFileHandle?.createWritable()?.then((stream) => {
      stream.write(State.toJsonString(newState))
      stream.close()
    })
  }

  /** 次の描画が完了した際にフォーカスしてほしいDOM要素のIDを設定する */
  export function requestFocusAfterRendering(elementId: string) {
    // 「1回の描画サイクル内で2回以上フォーカス先が指定されることはあってはならない」という仮定に基づくassert文。
    // この仮定の正しさにはあまり自信が無いが、考慮漏れや設計破綻を早期発見するためにとりあえずassertしておく。
    assert(pendingFocusElementId === undefined)

    pendingFocusElementId = elementId
  }
}
