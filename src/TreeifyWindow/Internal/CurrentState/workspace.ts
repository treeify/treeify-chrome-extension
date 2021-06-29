import {List, Set} from 'immutable'
import {ItemId, WorkspaceId} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {Workspace} from 'src/TreeifyWindow/Internal/State'
import {Timestamp} from 'src/TreeifyWindow/Timestamp'

const CURRENT_WORKSPACE_ID_KEY = 'CURRENT_WORKSPACE_ID_KEY'

/** このデバイスにおける現在のワークスペースのIDを返す */
export function getCurrentWorkspaceId(): Timestamp {
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

/** このデバイスにおける現在のワークスペースのIDを設定する */
export function setCurrentWorkspaceId(workspaceId: WorkspaceId) {
  localStorage.setItem(CURRENT_WORKSPACE_ID_KEY, workspaceId.toString())
}

/** Stateに登録されている全てのワークスペースIDを返す */
export function getWorkspaceIds(): List<WorkspaceId> {
  return List(Object.keys(Internal.instance.state.workspaces)).map((key) => parseInt(key))
}

/** 現在のワークスペースの除外アイテムリストを返す */
export function getExcludedItemIds(): List<ItemId> {
  return Internal.instance.state.workspaces[CurrentState.getCurrentWorkspaceId()].excludedItemIds
}

/** 現在のワークスペースの除外アイテムリストを設定する */
export function setExcludedItemIds(itemIds: List<ItemId>) {
  const currentWorkspaceId = CurrentState.getCurrentWorkspaceId()
  Internal.instance.mutate(
    itemIds,
    PropertyPath.of('workspaces', currentWorkspaceId, 'excludedItemIds')
  )
}

/** ワークスペースの名前を設定する */
export function setWorkspaceName(workspaceId: WorkspaceId, name: string) {
  Internal.instance.mutate(name, PropertyPath.of('workspaces', workspaceId, 'name'))
}

/** 空のワークスペースを作成する */
export function createWorkspace() {
  const workspaceId = Timestamp.now()
  const workspace: Workspace = {
    activePageId: CurrentState.getActivePageId(),
    excludedItemIds: List.of(),
    name: `ワークスペース${CurrentState.getWorkspaceIds().count() + 1}`,
  }
  Internal.instance.mutate(workspace, PropertyPath.of('workspaces', workspaceId))
}

/** 指定されたワークスペースを削除する */
export function deleteWorkspace(workspaceId: WorkspaceId) {
  Internal.instance.delete(PropertyPath.of('workspaces', workspaceId))
}

/** mountedPageIdsを除外アイテムでフィルタリングした結果を返す */
export function getFilteredMountedPageIds(): List<ItemId> {
  return Internal.instance.state.mountedPageIds.filterNot((pageId) => {
    return shouldBeHidden(pageId)
  })
}

/**
 * 除外アイテムでのフィルタリング用関数。
 * 与えられたアイテムが除外アイテムそのものであるか、先祖アイテムに除外アイテムが含まれる場合はtrueを返す。
 */
export function shouldBeHidden(itemId: ItemId) {
  const excludedItemIds = CurrentState.getExcludedItemIds()

  // 与えられたアイテムが除外アイテムそのものの場合
  if (excludedItemIds.contains(itemId)) return true

  // 与えられたアイテムの先祖アイテムに除外アイテムが含まれているかどうか
  return !Set(CurrentState.yieldAncestorItemIds(itemId)).intersect(excludedItemIds).isEmpty()
}
