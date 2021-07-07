import {List} from 'immutable'
import {integer} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyTab/basicType'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {State} from 'src/TreeifyTab/Internal/State'
import {
  createMainAreaNodeProps,
  MainAreaNodeProps,
} from 'src/TreeifyTab/View/MainArea/MainAreaNodeProps'

export type MainAreaProps = {
  rootNodeProps: MainAreaNodeProps
}

export function createMainAreaProps(state: State): MainAreaProps {
  const rootItemPath = List.of(CurrentState.getActivePageId())

  const allDisplayingItemIds = [...CurrentState.getAllDisplayingItemIds(state, rootItemPath)]
  // 足跡表示数を計算
  // TODO: パラメータをカスタマイズ可能にする。なおこれをCSS変数にしていいのかどうかは微妙な問題
  const footprintCount = Math.floor(allDisplayingItemIds.length ** 0.5)

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
    rootNodeProps: createMainAreaNodeProps(state, footprintRankMap, footprintCount, rootItemPath),
  }
}
