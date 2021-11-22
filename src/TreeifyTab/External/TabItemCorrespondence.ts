import { List } from 'immutable'
import { BiMap } from 'mnemonist'
import { ItemId, TabId } from 'src/TreeifyTab/basicType'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import Tab = chrome.tabs.Tab

/** ブラウザのタブとTreeifyのウェブページ項目を紐付けるためのクラス */
export class TabItemCorrespondence {
  // タブIDと項目IDの対応付け
  private readonly bimap = new BiMap<TabId, ItemId>()

  // タブIDからTabオブジェクトへのMap
  private readonly tabIdToTab = new Map<TabId, Tab>()

  getTabIdBy(itemId: ItemId): TabId | undefined {
    return this.bimap.inverse.get(itemId)
  }

  /**
   * タブに対応する項目IDを返す。
   * 「ウェブページ項目を削除→対応するタブを閉じる」という処理が行われる際、
   * 項目削除からchrome.tabs.onRemovedイベント発生までにタイムラグがあるので、
   * その間はこの関数の戻り値がundefinedになることに要注意。
   */
  getItemIdBy(tabId: TabId): ItemId | undefined {
    return this.bimap.get(tabId)
  }

  getTab(tabId: TabId): Tab | undefined {
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

  /** 指定されたウェブページ項目がアンロード状態かどうかを判定する */
  isUnloaded(itemId: ItemId): boolean {
    const tabId = this.getTabIdBy(itemId)
    return tabId === undefined || this.getTab(tabId)?.discarded === true
  }

  getAllItemIds(): List<ItemId> {
    return List(this.bimap.values())
  }

  /** 全てのaudibleなタブのIDを返す */
  getAllAudibleTabIds(): List<TabId> {
    const audibleTabs = List(this.tabIdToTab.values()).filter((tab) => tab.audible === true)
    return audibleTabs.map((tab) => {
      assertNonUndefined(tab.id)
      return tab.id
    })
  }

  /** 指定されたURLを持つタブを返す */
  getTabsByUrl(url: string): List<Tab> {
    return List(this.tabIdToTab.values()).filter((tab) => tab.url === url)
  }

  dumpCurrentState() {
    console.groupCollapsed('ダンプ：TabItemCorrespondence#tabIdToTab')
    const stateString = JSON.stringify(Object.fromEntries(this.tabIdToTab), undefined, 2)
    console.log(stateString)
    console.groupEnd()
  }
}
