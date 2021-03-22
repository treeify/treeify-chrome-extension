import {List} from 'immutable'
import {ItemId} from 'src/Common/basicType'
import {PropertyPath} from 'src/TreeifyWindow/Internal/Batchizer'
import {NextState} from 'src/TreeifyWindow/Internal/NextState/index'
import {Page} from 'src/TreeifyWindow/Internal/State'

/** アクティブページを返す */
export function getActivePageId(): ItemId {
  return NextState.getBatchizer().getDerivedValue(PropertyPath.of('activePageId'))
}

/** アクティブページを設定する */
export function setActivePageId(itemId: ItemId) {
  NextState.getBatchizer().postSetMutation(PropertyPath.of('activePageId'), itemId)
}

/** マウントされているページ群のアイテムIDを返す */
export function getMountedPageIds(): List<ItemId> {
  return NextState.getBatchizer().getDerivedValue(PropertyPath.of('mountedPageIds'))
}

/**
 * ページをマウントする。
 * マウント済みの場合は何もしない
 */
export function mountPage(itemId: ItemId) {
  const mountedPageIds = NextState.getMountedPageIds()
  if (mountedPageIds.contains(itemId)) return

  NextState.getBatchizer().postSetMutation(
    PropertyPath.of('mountedPageIds'),
    mountedPageIds.push(itemId)
  )
}

/**
 * ページをアンマウントする。
 * マウントされていない場合は何もしない。
 */
export function unmountPage(itemId: ItemId) {
  const mountedPageIds = NextState.getMountedPageIds()
  const index = mountedPageIds.indexOf(itemId)
  if (index !== -1) {
    NextState.getBatchizer().postSetMutation(
      PropertyPath.of('mountedPageIds'),
      mountedPageIds.remove(index)
    )
  }
}

/** 与えられたアイテムがページかどうかを返す */
export function isPage(itemId: ItemId) {
  const page = NextState.getBatchizer().getDerivedValue(PropertyPath.of('pages', itemId))
  return page !== undefined
}

/** 与えられたアイテムをページ化する */
export function becomePage(itemId: ItemId) {
  // 既にページだった場合は何もしない
  if (isPage(itemId)) return

  const page: Page = {
    targetItemPath: List.of(itemId),
  }
  NextState.getBatchizer().postSetMutation(PropertyPath.of('pages', itemId), page)
}

/**
 * 与えられたアイテムを非ページ化する。
 * 既に非ページだった場合は何もしない。
 */
export function becomeNonPage(itemId: ItemId) {
  if (!isPage(itemId)) return

  NextState.deleteProperty(PropertyPath.of('pages', itemId))
}
