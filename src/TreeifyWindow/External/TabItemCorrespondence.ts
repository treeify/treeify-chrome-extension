import {ItemId, TabId} from 'src/TreeifyWindow/basicType'
import {get} from 'src/TreeifyWindow/Internal/Derived/all'
import {writable, Writable} from 'svelte/store'
import Tab = chrome.tabs.Tab

/** ブラウザのタブとTreeifyのウェブページアイテムを紐付けるためのクラス */
export class TabItemCorrespondence {
  // タブIDからアイテムIDへのMap
  private readonly tabIdToItemId = new Map<TabId, ItemId>()
  // アイテムIDからTabオブジェクトへのMap
  private readonly itemIdToTab = new Map<ItemId, Writable<Tab | undefined>>()

  /** 指定されたアイテムに紐付いているタブIDを返す */
  getTabId(itemId: ItemId): TabId | undefined {
    const tab = get(this.getTab(itemId))
    return tab?.id
  }

  getItemId(tabId: TabId): ItemId | undefined {
    return this.tabIdToItemId.get(tabId)
  }

  /**
   * 指定されたアイテムに対応するchrome.tabs.Tabオブジェクトを返す。
   * アイテムに対応するタブがなければundefinedを返す。
   */
  getTab(itemId: ItemId): Writable<Tab | undefined> {
    const existingWritable = this.itemIdToTab.get(itemId)
    if (existingWritable === undefined) {
      const newWritable = writable(undefined)
      this.itemIdToTab.set(itemId, newWritable)
      return newWritable
    } else {
      return existingWritable
    }
  }

  /** アイテムIDとTabオブジェクトを紐付ける */
  tieTabAndItem(itemId: ItemId, tab: Tab) {
    // タブIDがない場合は結びつけ不可能
    if (tab.id === undefined) return

    this.tabIdToItemId.set(tab.id, itemId)
    this.getTab(itemId).set(tab)
  }

  /** タブIDとアイテムIDの結びつけを解除する */
  untieTabAndItemByTabId(tabId: TabId) {
    const itemId = this.getItemId(tabId)
    if (itemId !== undefined) {
      // 対応するタブが存在しなくなったことをWritableで通知する
      this.getTab(itemId).set(undefined)

      this.itemIdToTab.delete(itemId)
      this.tabIdToItemId.delete(tabId)
    }
  }

  /**
   * 指定されたウェブページアイテムがアンロード状態かどうかを判定する
   * TODO: 定義場所を移動する
   * @deprecated
   */
  isUnloaded(itemId: ItemId): boolean {
    return get(this.getTab(itemId))?.discarded === true
  }

  // TODO: 削除
  dumpCurrentState() {
    console.groupCollapsed('ダンプ：TabItemCorrespondence#itemIdToTab')
    const stateString = JSON.stringify(Object.fromEntries(this.itemIdToTab), undefined, 2)
    console.log(stateString)
    console.groupEnd()
  }
}
