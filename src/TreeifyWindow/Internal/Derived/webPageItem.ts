import {ItemId} from 'src/TreeifyWindow/basicType'
import {External} from 'src/TreeifyWindow/External/External'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {derived, get, Readable} from 'svelte/store'

export function getWebPageItemTitle(itemId: ItemId): Readable<string> {
  const webPageItem = Internal.instance.state.webPageItems[itemId]
  return derived([webPageItem.title, webPageItem.tabTitle, webPageItem.url], () => {
    const title = get(webPageItem.title) ?? get(webPageItem.tabTitle)
    return title !== '' ? title : get(webPageItem.url)
  })
}

/**
 * 指定されたアイテムに対応するタブが読込中かどうかを返す。
 * 対応するタブがない場合はfalseを返す。
 */
export function getTabIsLoading(itemId: ItemId): Readable<boolean> {
  const tab = External.instance.tabItemCorrespondence.getTab(itemId)
  return derived(tab, (tab) => {
    return tab?.status === 'loading'
  })
}

/**
 * 指定されたアイテムに対応するタブがdiscardされていればtrueを返す。
 * 対応するタブがない場合はfalseを返す。
 */
export function getTabIsSoftUnloaded(itemId: ItemId): Readable<boolean> {
  const tab = External.instance.tabItemCorrespondence.getTab(itemId)
  return derived(tab, (tab) => {
    return tab?.discarded === true
  })
}

/** 指定されたアイテムに対応するタブが存在しなければtrueを返す */
export function getTabIsHardUnloaded(itemId: ItemId): Readable<boolean> {
  const tab = External.instance.tabItemCorrespondence.getTab(itemId)
  return derived(tab, (tab) => {
    return tab === undefined
  })
}
