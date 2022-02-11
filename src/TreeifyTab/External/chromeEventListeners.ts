import MessageSender = chrome.runtime.MessageSender
import Tab = chrome.tabs.Tab
import TabActiveInfo = chrome.tabs.TabActiveInfo
import TabChangeInfo = chrome.tabs.TabChangeInfo
import TabRemoveInfo = chrome.tabs.TabRemoveInfo
import { DefaultMap } from 'mnemonist'
import { ItemId } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { Command } from 'src/TreeifyTab/Internal/Command'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { TreeifyTab } from 'src/TreeifyTab/TreeifyTab'
import { TabId } from 'src/Utility/browser'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { RArray$ } from 'src/Utility/fp-ts'
import { call } from 'src/Utility/function'
import { integer } from 'src/Utility/integer'

export const onMessage = (message: any, sender: MessageSender) => {
  call(async () => {
    const height = window.screen.availHeight
    switch (message.type) {
      case 'OnMouseMoveToLeftEnd':
        if (!Internal.instance.state.leftEndMouseGestureEnabled) break

        // 画面の四隅のボタンなどを押したいだけなのにTreeifyのイベントが誤発動してしまう問題の対策
        if (message.screenY < height * 0.15 || height * 0.85 < message.screenY) break

        // Treeifyタブを最前面化する
        // TODO: 誤差だろうけれど最適化の余地が一応ある
        TreeifyTab.open()
        break
      case 'OnMouseMoveToRightEnd':
        if (!Internal.instance.state.rightEndMouseGestureEnabled) break

        // 画面の四隅のボタンなどを押したいだけなのにTreeifyのイベントが誤発動してしまう問題の対策
        if (message.screenY < height * 0.15 || height * 0.85 < message.screenY) break

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
  const itemIdsForTabCreation = External.instance.urlToItemIdsForTabCreation.get(url)
  if (itemIdsForTabCreation.length === 0) {
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
        Rerenderer.instance.requestToFocusTargetItem()

        // 空のテキスト項目上で新しいタブを開いた場合は空のテキスト項目を削除する
        if (CurrentState.isEmptyTextItem(targetItemId)) {
          CurrentState.deleteItem(targetItemId)
        }
      }
    } else {
      // openerの最初の子として追加する
      CurrentState.insertFirstChildItem(openerItemId, newWebPageItemId)

      // openerがターゲット項目なら
      if (targetItemId === openerItemId) {
        // 自動的に展開する
        CurrentState.setIsFolded(targetItemPath, false)

        // フォーカスを移す
        if (tab.active) {
          const newItemPath = RArray$.append(newWebPageItemId)(targetItemPath)
          CurrentState.setTargetItemPath(newItemPath)
          Rerenderer.instance.requestToFocusTargetItem()
        }
      }
    }

    // もしUndoされるとタブと項目の対応関係が壊れるのでUndoさせないようにする
    // TODO: Undoスタックのサポート後はUndoスタックをクリアするよう修正する
    Internal.instance.saveCurrentStateToUndoStack()
  } else {
    // 既存のウェブページ項目に対応するタブが開かれた時

    const itemId = itemIdsForTabCreation[0]
    reflectInWebPageItem(itemId, tab)
    External.instance.tabItemCorrespondence.tieTabAndItem(tab.id, itemId)
    External.instance.urlToItemIdsForTabCreation.set(url, RArray$.shift(itemIdsForTabCreation))

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
    return External.instance.tabItemCorrespondence.getItemId(openerTabId)
  }
}

export function onUpdated(tabId: integer, changeInfo: TabChangeInfo, tab: Tab) {
  // Treeifyタブだった場合は何もしない。
  // 例えばdocument.titleを変更した際にonUpdatedイベントが発生する。
  if (tab.url === chrome.runtime.getURL('TreeifyTab/index.html')) return

  const itemId = External.instance.tabItemCorrespondence.getItemId(tabId)
  if (itemId === undefined) return

  reflectInWebPageItem(itemId, tab)
  Rerenderer.instance.rerender()
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

  const itemId = External.instance.tabItemCorrespondence.getItemId(tabId)
  // 項目削除に伴ってTreeifyが対応タブを閉じた場合はundefinedになる。
  // 次の2パターンが存在する。
  // (1) タブを強制的に閉じる処理でdiscardによってタブIDが変わったままでremoveされた場合
  // (2) 項目に対応するタブがdiscard済みのため直接閉じた場合（事前にuntieTabAndItemByTabIdが呼ばれている）
  if (itemId === undefined) return

  External.instance.tabItemCorrespondence.untieTabAndItemByTabId(tabId)

  if (External.instance.tabIdsToBeClosedForUnloading.has(tabId)) {
    // アンロードによりタブが閉じられた場合、ウェブページ項目は削除しない
    External.instance.tabIdsToBeClosedForUnloading.delete(tabId)
  } else if (CurrentState.isItem(itemId)) {
    // 対応するウェブページ項目を削除する
    if (itemId === ItemPath.getItemId(CurrentState.getTargetItemPath())) {
      Command.deleteJustOneItem()
    } else {
      CurrentState.deleteItem(itemId, true)
    }
  }

  Rerenderer.instance.rerender()
}

export function onActivated(tabActiveInfo: TabActiveInfo) {
  const itemId = External.instance.tabItemCorrespondence.getItemId(tabActiveInfo.tabId)
  if (itemId === undefined) return

  CurrentState.updateItemTimestamp(itemId)
  CurrentState.setIsUnreadFlag(itemId, false)

  // もしタブに対応する項目がアクティブページに所属していれば、それをターゲットする
  const activePageId = CurrentState.getActivePageId()
  for (const itemPath of CurrentState.yieldItemPaths(itemId)) {
    if (ItemPath.getRootItemId(itemPath) === activePageId && CurrentState.isVisible(itemPath)) {
      CurrentState.setTargetItemPath(itemPath)
      Rerenderer.instance.requestToFocusTargetItem()
      break
    }
  }
  Rerenderer.instance.rerender()
}

export function onReplaced(addedTabId: TabId, removedTabId: TabId) {
  const itemId = External.instance.tabItemCorrespondence.getItemId(removedTabId)
  if (itemId === undefined) return

  External.instance.tabItemCorrespondence.tieTabAndItem(addedTabId, itemId)
}

/**
 * 既存のタブとウェブページ項目のマッチングを行う。
 * URLが完全一致しているかどうかで判定する。
 */
export async function matchTabsAndWebPageItems() {
  // KeyはURL、ValueはそのURLを持つ項目ID
  const urlToItemIds = new DefaultMap<string, ItemId[]>(() => [])

  const webPageItems = Internal.instance.state.webPageItems
  for (const key in webPageItems) {
    const itemId = Number(key)
    const url = webPageItems[itemId].url
    urlToItemIds.get(url).push(itemId)
  }

  for (const tab of await getAllNonTreeifyTabs()) {
    assertNonUndefined(tab.id)

    const url = tab.pendingUrl ?? tab.url ?? ''
    const itemId = urlToItemIds.get(url).pop()
    if (itemId === undefined) {
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
