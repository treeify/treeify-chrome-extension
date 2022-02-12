import { DefaultMap } from 'mnemonist'
import { ItemId, WorkspaceId } from 'src/TreeifyTab/basicType'
import { DialogState } from 'src/TreeifyTab/External/DialogState'
import { TabItemCorrespondence } from 'src/TreeifyTab/External/TabItemCorrespondence'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { TabId } from 'src/Utility/browser'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { DiscriminatedUnion } from 'src/Utility/DiscriminatedUnion'
import { RArray } from 'src/Utility/fp-ts'
import { integer } from 'src/Utility/integer'

/** TODO: コメント */
export class External {
  static #instance: External | undefined

  private static readonly CURRENT_WORKSPACE_ID_KEY = 'CURRENT_WORKSPACE_ID_KEY'

  dialogState: DialogState | undefined

  /** データファイル同期の途中かどうか */
  isInSync: boolean = false

  /**
   * 前回の同期以降にStateが更新されたかどうか
   * TODO: この変数は本来は永続化されるべき。再起動時点で同期済みかどうかは状況次第なので。
   */
  hasUpdatedAfterSync = true

  /** ブラウザのタブとTreeifyのウェブページ項目を紐付けるためのオブジェクト */
  readonly tabItemCorrespondence = new TabItemCorrespondence()

  lastFocusedWindowId: integer = undefined as any

  currentWorkspaceId: WorkspaceId | undefined

  /** 既存のウェブページ項目に対応するタブを開いた際、タブ作成イベントリスナーで項目IDと紐付けるためのMap */
  readonly urlToItemIdsForTabCreation = new DefaultMap<string, RArray<ItemId>>(() => [])

  /** アンロードのために閉じられる途中のタブのIDの集合 */
  readonly tabIdsToBeClosedForUnloading = new Set<TabId>()

  /** 独自クリップボード */
  treeifyClipboard: TreeifyClipboard | undefined

  private constructor() {}

  /** シングルトンインスタンスを取得する */
  static get instance(): External {
    if (this.#instance === undefined) {
      this.#instance = new External()
    }
    return this.#instance
  }

  /** シングルトンインスタンスを破棄する */
  static cleanup() {
    this.#instance = undefined
  }

  onMutateState(statePath: StatePath) {
    this.hasUpdatedAfterSync = true
  }

  getTreeifyClipboardHash(): string | undefined {
    if (this.treeifyClipboard === undefined) return undefined

    return JSON.stringify(this.treeifyClipboard)
  }

  /**
   * タブを閉じる際にbeforeunloadイベントを利用して確認ダイアログを表示するウェブページ対策。
   * 項目削除時にそれに紐づくタブが生き残ると整合性が壊れるので強制的に閉じる。
   */
  async forceCloseTab(tabId: TabId) {
    const tab = this.tabItemCorrespondence.getTabByTabId(tabId)
    assertNonUndefined(tab)
    this.tabItemCorrespondence.untieTabAndItemByTabId(tabId)
    if (!tab.discarded) {
      // タブを強制的に閉じる処理を開始する
      const discardedTab = await chrome.tabs.discard(tabId)
      assertNonUndefined(discardedTab.id)
      await chrome.tabs.remove(discardedTab.id)
    } else {
      await chrome.tabs.remove(tabId)
    }
  }

  /** このインスタンスにおける現在のワークスペースのIDを返す */
  getCurrentWorkspaceId(): WorkspaceId {
    if (this.currentWorkspaceId !== undefined) {
      return this.currentWorkspaceId
    }

    const savedCurrentWorkspaceId = localStorage.getItem(External.CURRENT_WORKSPACE_ID_KEY)
    if (savedCurrentWorkspaceId !== null) {
      const parsedCurrentWorkspaceId = Number(savedCurrentWorkspaceId)
      if (Internal.instance.state.workspaces[parsedCurrentWorkspaceId] !== undefined) {
        // ローカルに保存されたvalidなワークスペースIDがある場合

        this.currentWorkspaceId = parsedCurrentWorkspaceId
        return this.currentWorkspaceId
      }
    }

    // 既存のワークスペースを適当に選んでIDを返す。
    // おそらく最も昔に作られた（≒初回起動時に作られた）ワークスペースが選ばれると思うが、そうならなくてもまあいい。
    this.currentWorkspaceId = CurrentState.getWorkspaceIds()[0]
    localStorage.setItem(External.CURRENT_WORKSPACE_ID_KEY, this.currentWorkspaceId.toString())
    return this.currentWorkspaceId
  }

  /** このインスタンスにおける現在のワークスペースのIDを設定する */
  setCurrentWorkspaceId(workspaceId: WorkspaceId) {
    this.currentWorkspaceId = workspaceId
    localStorage.setItem(External.CURRENT_WORKSPACE_ID_KEY, workspaceId.toString())
  }

  dumpCurrentState() {
    this.tabItemCorrespondence.dumpCurrentState()
  }
}

type TreeifyClipboard = DiscriminatedUnion<{
  CopyForTransclude: {
    selectedItemPaths: RArray<ItemPath>
  }
  CopyForMove: {
    selectedItemPaths: RArray<ItemPath>
  }
}>
