import { pipe } from 'fp-ts/function'
import { ItemId, WorkspaceId } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { Workspace } from 'src/TreeifyTab/Internal/State'
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { NERArray, NERArray$, Option$, RArray, RArray$, RRecord$, RSet$ } from 'src/Utility/fp-ts'
import { Timestamp } from 'src/Utility/Timestamp'

/** Stateに登録されている全てのワークスペースIDを返す */
export function getWorkspaceIds(): RArray<WorkspaceId> {
  return RRecord$.numberKeys(Internal.instance.state.workspaces)
}

/** 現在のワークスペースの除外項目リストを返す */
export function getExcludedItemIds(): RArray<ItemId> {
  const currentWorkspaceId = External.instance.getCurrentWorkspaceId()
  return Internal.instance.state.workspaces[currentWorkspaceId].excludedItemIds
}

/** 現在のワークスペースの除外項目リストを設定する */
export function setExcludedItemIds(itemIds: RArray<ItemId>) {
  const currentWorkspaceId = External.instance.getCurrentWorkspaceId()
  Internal.instance.mutate(
    itemIds,
    StatePath.of('workspaces', currentWorkspaceId, 'excludedItemIds')
  )
}

/** ワークスペースの名前を設定する */
export function setWorkspaceName(workspaceId: WorkspaceId, name: string) {
  Internal.instance.mutate(name, StatePath.of('workspaces', workspaceId, 'name'))
}

/** 空のワークスペースを作成する */
export function createWorkspace(): WorkspaceId {
  const workspaceId = Timestamp.now()
  const workspace: Workspace = {
    name: `ワークスペース${CurrentState.getWorkspaceIds().length + 1}`,
    activePageId: CurrentState.getActivePageId(),
    excludedItemIds: [],
    searchHistory: [],
  }
  Internal.instance.mutate(workspace, StatePath.of('workspaces', workspaceId))
  return workspaceId
}

/** 指定されたワークスペースを削除する */
export function deleteWorkspace(workspaceId: WorkspaceId) {
  Internal.instance.delete(StatePath.of('workspaces', workspaceId))

  // もしcurrentWorkspaceを削除した場合は1番目のワークスペースに切り替える
  const currentWorkspaceId = External.instance.getCurrentWorkspaceId()
  const workspaces = Internal.instance.state.workspaces
  if (workspaces[currentWorkspaceId] === undefined) {
    External.instance.setCurrentWorkspaceId(Number(Object.keys(workspaces)[0]))
  }
}

/** mountedPageIdsを除外項目でフィルタリングした結果を返す */
export function getFilteredMountedPageIds(): NERArray<ItemId> {
  return pipe(
    Internal.instance.state.mountedPageIds,
    RArray$.filter((pageId: ItemId) => !shouldBeHidden(pageId)),
    NERArray$.fromReadonlyArray,
    Option$.getOrThrow
  )
}

/**
 * 除外項目でのフィルタリング用関数。
 * 与えられた項目が除外項目そのものであるか、先祖項目に除外項目が含まれる場合はtrueを返す。
 */
export function shouldBeHidden(itemId: ItemId) {
  const excludedItemIds = CurrentState.getExcludedItemIds()

  // 与えられた項目が除外項目そのものの場合
  if (excludedItemIds.includes(itemId)) return true

  // 与えられた項目の先祖項目に除外項目が含まれているかどうか
  return !RSet$.isDisjoint(
    RSet$.from(CurrentState.yieldAncestorItemIds(itemId)),
    RSet$.from(excludedItemIds)
  )
}
