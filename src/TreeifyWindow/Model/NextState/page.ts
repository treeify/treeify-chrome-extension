import {ItemId} from 'src/Common/basicType'
import {PropertyPath} from 'src/TreeifyWindow/Model/Batchizer'
import {NextState} from 'src/TreeifyWindow/Model/NextState/index'
import {Page} from 'src/TreeifyWindow/Model/State'

/** アクティブページを返す */
export function getActivePageId(): ItemId {
  return NextState.getBatchizer().getDerivedValue(PropertyPath.of('activePageId'))
}

/** アクティブページを設定する */
export function setActivePageId(itemId: ItemId) {
  NextState.getBatchizer().postSetMutation(PropertyPath.of('activePageId'), itemId)
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

  const page: Page = {}
  NextState.getBatchizer().postSetMutation(PropertyPath.of('pages', itemId), page)
}

/** 与えられたアイテムを非ページ化する */
export function becomeNonPage(itemId: ItemId) {
  // 既に非ページだった場合は何もしない
  if (!isPage(itemId)) return

  NextState.deleteProperty(PropertyPath.of('pages', itemId))
}
