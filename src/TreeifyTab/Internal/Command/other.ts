import { pipe } from 'fp-ts/function'
import { TOP_ITEM_ID } from 'src/TreeifyTab/basicType'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { RArray$, RSet$ } from 'src/Utility/fp-ts'

/**
 * ターゲット項目をワークスペースの除外項目リストに入れる。
 * もし既に除外されていれば除外を解除する。
 * ただしトップページは除外できない。
 */
export function toggleExcluded() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const selectedItemIds = pipe(
    RSet$.from(selectedItemPaths.map(ItemPath.getItemId)),
    RSet$.remove(TOP_ITEM_ID)
  )
  const excludedItemIds = RSet$.from(CurrentState.getExcludedItemIds())

  // いわゆるxorのメソッドが見当たらないので同等の処理をする
  const union = RSet$.union(selectedItemIds, excludedItemIds)
  const intersection = RSet$.intersection(selectedItemIds, excludedItemIds)
  CurrentState.setExcludedItemIds(RArray$.from(RSet$.difference(union, intersection)))
}

/**
 * 役割は2つ。
 * ・特定のキー入力でのブラウザのデフォルト動作を阻止するために割り当てる（preventDefaultが呼ばれるので）
 * ・キーボード操作設定ダイアログでキーバインドを追加した際の無難な初期値
 */
export function doNothing() {}
