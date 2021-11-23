import MessageSender = chrome.runtime.MessageSender
import Tab = chrome.tabs.Tab
import TabActiveInfo = chrome.tabs.TabActiveInfo
import TabChangeInfo = chrome.tabs.TabChangeInfo
import TabRemoveInfo = chrome.tabs.TabRemoveInfo
import { List } from 'immutable'
import { ItemId, TabId } from 'src/TreeifyTab/basicType'
import { doAsyncWithErrorCapture } from 'src/TreeifyTab/errorCapture'
import { External } from 'src/TreeifyTab/External/External'
import { Command } from 'src/TreeifyTab/Internal/Command'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { TreeifyTab } from 'src/TreeifyTab/TreeifyTab'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { integer } from 'src/Utility/integer'

export const onMessage = (message: any, sender: MessageSender) => {
  doAsyncWithErrorCapture(async () => {
    const height = window.innerHeight
    switch (message.type) {
      case 'OnMouseMoveToLeftEnd':
        if (!Internal.instance.state.leftEndMouseGestureEnabled) break

        // 画面の四隅のボタンなどを押したいだけなのにTreeifyのイベントが誤発動してしまう問題の対策
        if (message.clientY < height * 0.15 || height * 0.85 < message.clientY) break

        // Treeifyタブを最前面化する
        // TODO: 誤差だろうけれど最適化の余地が一応ある
        TreeifyTab.open()
        break
      case 'OnMouseMoveToRightEnd':
        if (!Internal.instance.state.rightEndMouseGestureEnabled) break

        // 画面の四隅のボタンなどを押したいだけなのにTreeifyのイベントが誤発動してしまう問題の対策
        if (message.clientY < height * 0.15 || height * 0.85 < message.clientY) break

        await TreeifyTab.open()
        if (sender.tab?.id !== undefined) {
          chrome.tabs.remove(sender.tab.id)
        }
        break
    }
  })
}

export function onCreated(tab: Tab) {
  // もしこうなるケースがあるならきちんと対応を考えたいのでエラーにする
  assertNonUndefined(tab.id)

  const url = tab.url || tab.pendingUrl || ''
  const itemIdsForTabCreation = External.instance.urlToItemIdsForTabCreation.get(url) ?? List.of()
  if (itemIdsForTabCreation.isEmpty()) {
    // タブに対応するウェブページ項目がない時

    // ウェブページ項目を作る
    const newWebPageItemId = CurrentState.createWebPageItem()
    reflectInWebPageItem(newWebPageItemId, tab)
    External.instance.tabItemCorrespondence.tieTabAndItem(tab.id, newWebPageItemId)

    // タブがバックグラウンドで開かれたら未読フラグを立てる
    if (!tab.active || tab.windowId !== External.instance.lastFocusedWindowId) {
      CurrentState.setIsUnreadFlag(newWebPageItemId, true)
    }

    const targetItemPath = CurrentState.getTargetItemPath()
    const targetItemId = ItemPath.getItemId(targetItemPath)

    const openerItemId = getOpenerItemId(url, tab.openerTabId)
    if (openerItemId === undefined) {
      const newItemPath = CurrentState.insertBelowItem(targetItemPath, newWebPageItemId)
      if (tab.active) {
        CurrentState.setTargetItemPath(newItemPath)

        // 空のテキスト項目上で新しいタブを開いた場合は空のテキスト項目を削除する
        if (CurrentState.isEmptyTextItem(targetItemId)) {
          CurrentState.deleteItem(targetItemId)
        }
      }
    } else {
      // openerの最後の子として追加する
      CurrentState.insertLastChildItem(openerItemId, newWebPageItemId)

      // openerがターゲット項目なら
      if (targetItemId === openerItemId) {
        // 自動的に展開する
        CurrentState.setIsFolded(targetItemPath, false)

        // フォーカスを移す
        if (tab.active) {
          const newItemPath = targetItemPath.push(newWebPageItemId)
          CurrentState.setTargetItemPath(newItemPath)
        }
      }
    }
  } else {
    // 既存のウェブページ項目に対応するタブが開かれた時

    const itemId = itemIdsForTabCreation.first(undefined)
    assertNonUndefined(itemId)
    reflectInWebPageItem(itemId, tab)
    External.instance.tabItemCorrespondence.tieTabAndItem(tab.id, itemId)
    External.instance.urlToItemIdsForTabCreation.set(url, itemIdsForTabCreation.shift())

    // タブがバックグラウンドで開かれたら未読フラグを立てる
    if (!tab.active || tab.windowId !== External.instance.lastFocusedWindowId) {
      CurrentState.setIsUnreadFlag(itemId, true)
    }
  }

  Rerenderer.instance.rerender()
}

// どのウェブページ項目から開かれたタブかを返す
function getOpenerItemId(url: string, openerTabId: TabId | undefined): ItemId | undefined {
  if (url === 'chrome://newtab/' || openerTabId === undefined) {
    return undefined
  } else {
    return External.instance.tabItemCorrespondence.getItemIdBy(openerTabId)
  }
}

export async function onUpdated(tabId: integer, changeInfo: TabChangeInfo, tab: Tab) {
  doAsyncWithErrorCapture(async () => {
    // Treeifyタブだった場合は何もしない。
    // 例えばdocument.titleを変更した際にonUpdatedイベントが発生する。
    if (tab.url === chrome.runtime.getURL('TreeifyTab/index.html')) return

    if (changeInfo.discarded) {
      // discardされたらタブIDが変わるので項目IDとの対応関係を修正する
      // TODO: ↓は手抜き実装。最適化の余地あり
      await matchTabsAndWebPageItems()
    }

    const itemId = External.instance.tabItemCorrespondence.getItemIdBy(tabId)
    if (itemId === undefined) return

    // TODO: 削除。これはファビコン無限ぐるぐる問題の調査用なので
    if (tab.id === undefined) {
      alert(`tab.id === undefined!\nitemId = ${itemId}, tab = ${tab}`)
    }

    reflectInWebPageItem(itemId, tab)
    Rerenderer.instance.rerender()
  })
}

// Tabの情報をウェブページ項目に転写する
function reflectInWebPageItem(itemId: ItemId, tab: Tab) {
  if (tab.id !== undefined) {
    External.instance.tabItemCorrespondence.registerTab(tab.id, tab)
  }
  CurrentState.setWebPageItemTabTitle(itemId, tab.title ?? '')
  const url = tab.url || tab.pendingUrl || ''
  CurrentState.setWebPageItemUrl(itemId, url)
  CurrentState.setWebPageItemFaviconUrl(itemId, tab.favIconUrl ?? '')
}

export function onRemoved(tabId: integer, removeInfo: TabRemoveInfo) {
  External.instance.tabItemCorrespondence.unregisterTab(tabId)

  const itemId = External.instance.tabItemCorrespondence.getItemIdBy(tabId)
  // 項目削除に伴ってTreeifyが対応タブを閉じた場合はundefinedになる
  if (itemId === undefined) return

  External.instance.tabItemCorrespondence.untieTabAndItemByTabId(tabId)

  if (External.instance.tabIdsToBeClosedForUnloading.has(tabId)) {
    // アンロードによりタブが閉じられた場合、ウェブページ項目は削除しない
    External.instance.tabIdsToBeClosedForUnloading.delete(tabId)
  } else if (CurrentState.isItem(itemId)) {
    // 対応するウェブページ項目を削除する
    if (itemId === ItemPath.getItemId(CurrentState.getTargetItemPath())) {
      Command.deleteItemItself()
    } else {
      CurrentState.deleteItemItself(itemId)
    }
  }

  Rerenderer.instance.rerender()
}

export function onActivated(tabActiveInfo: TabActiveInfo) {
  const itemId = External.instance.tabItemCorrespondence.getItemIdBy(tabActiveInfo.tabId)
  if (itemId === undefined) return

  CurrentState.updateItemTimestamp(itemId)
  CurrentState.setIsUnreadFlag(itemId, false)

  // もしタブに対応する項目がアクティブページに所属していれば、それをターゲットする
  const activePageId = CurrentState.getActivePageId()
  for (const itemPath of CurrentState.yieldItemPaths(itemId)) {
    if (ItemPath.getRootItemId(itemPath) === activePageId && CurrentState.isVisible(itemPath)) {
      CurrentState.setTargetItemPath(itemPath)
      break
    }
  }
  Rerenderer.instance.rerender()
}

/**
 * 既存のタブとウェブページ項目のマッチングを行う。
 * URLが完全一致しているかどうかで判定する。
 */
export async function matchTabsAndWebPageItems() {
  // KeyはURL、ValueはそのURLを持つ項目ID
  const urlToItemIds = new Map<string, List<ItemId>>()

  const webPageItems = Internal.instance.state.webPageItems
  for (const key in webPageItems) {
    const itemId = parseInt(key)
    const url = webPageItems[itemId].url
    urlToItemIds.set(url, (urlToItemIds.get(url) ?? List.of()).push(itemId))
  }

  for (const tab of await getAllNonTreeifyTabs()) {
    assertNonUndefined(tab.id)

    const url = tab.pendingUrl ?? tab.url ?? ''
    const webPageItemIds = urlToItemIds.get(url)
    if (webPageItemIds === undefined) {
      // URLの一致するウェブページ項目がない場合、
      // ウェブページ項目を作る
      const newWebPageItemId = CurrentState.createWebPageItem()
      reflectInWebPageItem(newWebPageItemId, tab)
      External.instance.tabItemCorrespondence.tieTabAndItem(tab.id, newWebPageItemId)

      // アクティブページの最初の子として追加する
      const activePageId = CurrentState.getActivePageId()
      CurrentState.insertFirstChildItem(activePageId, newWebPageItemId)
    } else {
      // URLの一致するウェブページ項目がある場合
      const itemId: ItemId = webPageItemIds.last()

      if (webPageItemIds.size === 1) {
        urlToItemIds.delete(url)
      } else {
        urlToItemIds.set(url, webPageItemIds.pop())
      }

      reflectInWebPageItem(itemId, tab)
      External.instance.tabItemCorrespondence.tieTabAndItem(tab.id, itemId)
    }
  }
}

// Treeifyタブを除く全タブを返す
async function getAllNonTreeifyTabs(): Promise<Tab[]> {
  const windows = await chrome.windows.getAll({ populate: true })
  const tabs = windows.flatMap((window) => window.tabs ?? [])
  return tabs.filter((tab) => !tab.url?.startsWith(chrome.runtime.getURL('TreeifyTab/index.html')))
}

export function onWindowFocusChanged(windowId: integer) {
  External.instance.lastFocusedWindowId = windowId
}
