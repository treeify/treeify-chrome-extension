import {List} from 'immutable'
import {integer} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {
  createItemTreeNodeViewModel,
  ItemTreeNodeViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeNodeView'

export type ItemTreeViewModel = {
  rootNodeViewModel: ItemTreeNodeViewModel
}

export function createItemTreeViewModel(state: State): ItemTreeViewModel {
  const rootItemPath = List.of(CurrentState.getActivePageId())

  const allDisplayingItemIds = [...getAllDisplayingItemIds(state, rootItemPath)]
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
    rootNodeViewModel: createItemTreeNodeViewModel(
      state,
      footprintRankMap,
      footprintCount,
      rootItemPath
    ),
  }
}

/**
 * 全ての子孫と自身のアイテムIDを返す。
 * ただし（折りたたみなどの理由で）表示されないアイテムはスキップする。
 */
function* getAllDisplayingItemIds(state: State, itemPath: ItemPath): Generator<ItemId> {
  yield ItemPath.getItemId(itemPath)
  for (const childItemId of CurrentState.getDisplayingChildItemIds(itemPath)) {
    yield* getAllDisplayingItemIds(state, itemPath.push(childItemId))
  }
}
