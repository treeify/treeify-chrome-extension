import {List} from 'immutable'
import {integer} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createItemTreeNodeProps,
  ItemTreeNodeProps,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeNodeProps'

export type ItemTreeProps = {
  rootNodeProps: ItemTreeNodeProps
}

export function createItemTreeProps(state: State): ItemTreeProps {
  const rootItemPath = List.of(CurrentState.getActivePageId())

  const allDisplayingItemIds = [...CurrentState.getAllDisplayingItemIds(state, rootItemPath)]
  // 足跡表示数を計算
  // TODO: パラメータをカスタマイズ可能にする。なおこれをCSS変数にしていいのかどうかは微妙な問題
  const footprintCount = Math.floor(Math.pow(allDisplayingItemIds.length, 0.5))

  // TODO: 同時に複数のアイテムが操作された場合でも足跡をきちんと表示できるように修正する
  const sorted = allDisplayingItemIds.sort((a: ItemId, b: ItemId) => {
    return state.items[b].timestamp - state.items[a].timestamp
  })

  // 各アイテムに足跡順位を対応付け
  const footprintRankMap = new Map<ItemId, integer>()
  for (let i = 0; i < footprintCount; i++) {
    footprintRankMap.set(sorted[i], i)
  }

  return {
    rootNodeProps: createItemTreeNodeProps(state, footprintRankMap, footprintCount, rootItemPath),
  }
}
