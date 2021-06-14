import {ItemId, TabId} from 'src/TreeifyWindow/basicType'
import Tab = chrome.tabs.Tab

/** ブラウザのタブとTreeifyのウェブページアイテムを紐付けるためのクラス */
export class TabItemCorrespondence {
  // タブIDからアイテムIDへのMap
  private readonly tabIdToItemId = new Map<TabId, ItemId>()
  // アイテムIDからTabオブジェクトへのMap
  private readonly itemIdToTab = new Map<ItemId, Tab>()

  /** 指定されたアイテムに紐付いているタブIDを返す */
  getTabId(itemId: ItemId): TabId | undefined {
    return this.getTab(itemId)?.id
  }

  getItemId(tabId: TabId): ItemId | undefined {
    return this.tabIdToItemId.get(tabId)
  }

  /**
   * 指定されたアイテムに対応するchrome.tabs.Tabオブジェクトを返す。
   * アイテムに対応するタブがなければundefinedを返す。
   */
  getTab(itemId: ItemId): Tab | undefined {
    return this.itemIdToTab.get(itemId)
  }

  /** アイテムIDとTabオブジェクトを紐付ける */
  tieTabAndItem(itemId: ItemId, tab: Tab) {
    // タブIDがない場合は結びつけ不可能
    if (tab.id === undefined) return

    this.tabIdToItemId.set(tab.id, itemId)
    this.itemIdToTab.set(itemId, tab)
  }

  /** タブIDとアイテムIDの結びつけを解除する */
  untieTabAndItemByTabId(tabId: TabId) {
    const itemId = this.getItemId(tabId)
    if (itemId !== undefined) {
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
    return this.getTab(itemId)?.discarded === true
  }
}
