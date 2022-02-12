import { pipe } from 'fp-ts/function'
import { ItemId, WorkspaceId } from 'src/TreeifyTab/basicType'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { Workspace } from 'src/TreeifyTab/Internal/State'
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { NERArray, NERArray$, Option$, RArray, RArray$, RSet$ } from 'src/Utility/fp-ts'
import { Timestamp } from 'src/Utility/Timestamp'

const CURRENT_WORKSPACE_ID_KEY = 'CURRENT_WORKSPACE_ID_KEY'
// localStorageのキャッシュ
let currentWorkspaceId: WorkspaceId | undefined

/** このインスタンスにおける現在のワークスペースのIDを返す */
export function getCurrentWorkspaceId(): WorkspaceId {
  if (currentWorkspaceId !== undefined) {
    return currentWorkspaceId
  }

  const savedCurrentWorkspaceId = localStorage.getItem(CURRENT_WORKSPACE_ID_KEY)
  if (savedCurrentWorkspaceId !== null) {
    const parsedCurrentWorkspaceId = Number(savedCurrentWorkspaceId)
    if (Internal.instance.state.workspaces[parsedCurrentWorkspaceId] !== undefined) {
      // ローカルに保存されたvalidなワークスペースIDがある場合

      currentWorkspaceId = parsedCurrentWorkspaceId
      return currentWorkspaceId
    }
  }

  // 既存のワークスペースを適当に選んでIDを返す。
  // おそらく最も昔に作られた（≒初回起動時に作られた）ワークスペースが選ばれると思うが、そうならなくてもまあいい。
  currentWorkspaceId = getWorkspaceIds()[0]
  localStorage.setItem(CURRENT_WORKSPACE_ID_KEY, currentWorkspaceId.toString())
  return currentWorkspaceId
}

/** このインスタンスにおける現在のワークスペースのIDを設定する */
export function setCurrentWorkspaceId(workspaceId: WorkspaceId) {
  currentWorkspaceId = workspaceId
  localStorage.setItem(CURRENT_WORKSPACE_ID_KEY, workspaceId.toString())
}

/** Stateに登録されている全てのワークスペースIDを返す */
export function getWorkspaceIds(): RArray<WorkspaceId> {
  return Object.keys(Internal.instance.state.workspaces).map(Number)
}

/** 現在のワークスペースの除外項目リストを返す */
export function getExcludedItemIds(): RArray<ItemId> {
  return Internal.instance.state.workspaces[CurrentState.getCurrentWorkspaceId()].excludedItemIds
}

/** 現在のワークスペースの除外項目リストを設定する */
export function setExcludedItemIds(itemIds: RArray<ItemId>) {
  const currentWorkspaceId = CurrentState.getCurrentWorkspaceId()
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
