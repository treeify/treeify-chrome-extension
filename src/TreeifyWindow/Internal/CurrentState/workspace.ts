import {List} from 'immutable'
import {ItemId, WorkspaceId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {Timestamp} from 'src/TreeifyWindow/Timestamp'

/** このデバイスにおける現在のワークスペースのIDを返す */
export function getCurrentWorkspaceId(): Timestamp {
  const CURRENT_WORKSPACE_ID_KEY = 'CURRENT_WORKSPACE_ID_KEY'
  const savedCurrentWorkspaceId = localStorage.getItem(CURRENT_WORKSPACE_ID_KEY)
  if (savedCurrentWorkspaceId !== null) {
    const currentWorkspaceId = parseInt(savedCurrentWorkspaceId)
    if (Internal.instance.state.workspaces[currentWorkspaceId] !== undefined) {
      // ローカルに保存されたvalidなワークスペースIDがある場合
      return currentWorkspaceId
    }
  }

  // 既存のワークスペースを適当に選んでIDを返す。
  // おそらく最も昔に作られた（≒初回起動時に作られた）ワークスペースが選ばれると思うが、そうならなくてもまあいい。
  const currentWorkspaceId = getWorkspaceIds().first() as WorkspaceId
  localStorage.setItem(CURRENT_WORKSPACE_ID_KEY, currentWorkspaceId.toString())
  return currentWorkspaceId
}

/** Stateに登録されている全てのワークスペースIDを返す */
export function getWorkspaceIds(): List<WorkspaceId> {
  return List(Object.keys(Internal.instance.state.workspaces)).map(parseInt)
}

/** 現在のワークスペースの除外アイテムリストを返す */
export function getExcludedItemIds(): List<ItemId> {
  return Internal.instance.state.workspaces[CurrentState.getCurrentWorkspaceId()].excludedItemIds
}

/** 現在のワークスペースの除外アイテムリストを設定する */
export function setExcludedItemIds(itemIds: List<ItemId>) {
  const currentWorkspaceId = CurrentState.getCurrentWorkspaceId()
  Internal.instance.state.workspaces[currentWorkspaceId].excludedItemIds = itemIds
  Internal.instance.markAsMutated(
    PropertyPath.of('workspaces', currentWorkspaceId, 'excludedItemIds')
  )
}

/** 先祖アイテムのジェネレーター */
export function* yieldAncestorItemIds(itemId: ItemId): Generator<ItemId> {
  for (const parentItemId of CurrentState.getParentItemIds(itemId)) {
    yield parentItemId
    yield* yieldAncestorItemIds(parentItemId)
  }
}
