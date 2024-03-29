import { BiMap } from 'mnemonist'
import { ItemId } from 'src/TreeifyTab/basicType'
import { TabId } from 'src/Utility/browser'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { RArray } from 'src/Utility/fp-ts'
import Tab = chrome.tabs.Tab

/** ブラウザのタブとTreeifyのウェブページ項目を紐付けるためのクラス */
export class TabItemCorrespondence {
  // タブIDと項目IDの対応付け
  private readonly bimap = new BiMap<TabId, ItemId>()

  // タブIDからTabオブジェクトへのMap
  private readonly tabIdToTab = new Map<TabId, Tab>()

  getTabId(itemId: ItemId): TabId | undefined {
    return this.bimap.inverse.get(itemId)
  }

  /**
   * タブに対応する項目IDを返す。
   * 「ウェブページ項目を削除→対応するタブを閉じる」という処理が行われる際、
   * 項目削除からchrome.tabs.onRemovedイベント発生までにタイムラグがあるので、
   * その間はこの関数の戻り値がundefinedになることに要注意。
   */
  getItemId(tabId: TabId): ItemId | undefined {
    return this.bimap.get(tabId)
  }

  getTabByTabId(tabId: TabId): Tab | undefined {
    return this.tabIdToTab.get(tabId)
  }

  getTabByItemId(itemId: ItemId): Tab | undefined {
    const tabId = this.getTabId(itemId)
    if (tabId === undefined) return undefined

    return this.tabIdToTab.get(tabId)
  }

  /** タブIDとTabオブジェクトを紐付ける */
  registerTab(tabId: TabId, tab: Tab) {
    this.tabIdToTab.set(tabId, tab)
  }

  /** Tabオブジェクトを削除する */
  unregisterTab(tabId: TabId) {
    this.tabIdToTab.delete(tabId)
  }

  /** タブIDと項目IDを結びつける */
  tieTabAndItem(tabId: TabId, itemId: ItemId) {
    this.bimap.set(tabId, itemId)
  }

  /** タブIDと項目IDの結びつけを解除する */
  untieTabAndItemByTabId(tabId: TabId) {
    this.bimap.delete(tabId)
  }

  getAllItemIds(): RArray<ItemId> {
    return [...this.bimap.values()]
  }

  /** 全てのaudibleなタブのIDを返す */
  getAllAudibleTabIds(): RArray<TabId> {
    const audibleTabs = Array.from(this.tabIdToTab.values()).filter((tab) => tab.audible === true)
    return audibleTabs.map((tab) => {
      assertNonUndefined(tab.id)
      return tab.id
    })
  }

  /** 指定されたURLを持つタブを返す */
  getTabsByUrl(url: string): RArray<Tab> {
    return [...this.tabIdToTab.values()].filter((tab) => tab.url === url)
  }
}
