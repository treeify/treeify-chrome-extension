import { List } from 'immutable'
import md5 from 'md5'
import { MultiSet } from 'mnemonist'
import { ItemId } from 'src/TreeifyTab/basicType'
import { DataFolder } from 'src/TreeifyTab/External/DataFolder'
import { Dialog } from 'src/TreeifyTab/External/DialogState'
import { TabItemCorrespondence } from 'src/TreeifyTab/External/TabItemCorrespondence'
import { Chunk, ChunkId } from 'src/TreeifyTab/Internal/Chunk'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { State } from 'src/TreeifyTab/Internal/State'
import { TabId } from 'src/Utility/browser'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { DiscriminatedUnion } from 'src/Utility/DiscriminatedUnion'
import { integer } from 'src/Utility/integer'

/** TODO: コメント */
export class External {
  static #instance: External | undefined

  dialogState: Dialog | undefined

  /** データフォルダ */
  dataFolder: DataFolder | undefined
  /** データフォルダに書き込むべきChunkId群 */
  pendingMutatedChunkIds = new Set<ChunkId>()
  /** Undo用 */
  prevPendingMutatedChunkIds: Set<ChunkId> | undefined

  /** ブラウザのタブとTreeifyのウェブページ項目を紐付けるためのオブジェクト */
  readonly tabItemCorrespondence = new TabItemCorrespondence()

  lastFocusedWindowId: integer = undefined as any

  /** 既存のウェブページ項目に対応するタブを開いた際、タブ作成イベントリスナーで項目IDと紐付けるためのMap */
  readonly urlToItemIdsForTabCreation = new Map<string, List<ItemId>>()

  /** アンロードのために閉じられる途中のタブのIDの集合 */
  readonly tabIdsToBeClosedForUnloading = new Set<TabId>()

  /**
   * 強制的にタブを閉じる処理中のタブのIDの集合。
   * discard時とremove時の両方で使う。
   */
  readonly forceClosingTabUrls = new MultiSet<string>()

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

  onMutateState(propertyPath: PropertyPath) {
    if (this.dataFolder !== undefined) {
      // データフォルダへの差分書き込みの対象箇所を伝える
      this.pendingMutatedChunkIds.add(Chunk.convertToChunkId(propertyPath))
    }
  }

  getTreeifyClipboardHash(): string | undefined {
    if (this.treeifyClipboard === undefined) return undefined

    const jsonString = JSON.stringify(this.treeifyClipboard, State.jsonReplacer)
    return md5(jsonString)
  }

  /**
   * タブを閉じる際にbeforeunloadイベントを利用して確認ダイアログを表示するウェブページ対策。
   * 項目削除時にそれに紐づくタブが生き残ると整合性が壊れるので強制的に閉じる。
   */
  async forceCloseTab(tabId: TabId) {
    const tab = this.tabItemCorrespondence.getTab(tabId)
    assertNonUndefined(tab)
    if (!tab.discarded) {
      // タブを強制的に閉じる処理を開始する
      this.forceClosingTabUrls.add(tab.url ?? '')
      await chrome.tabs.discard(tabId)
    } else {
      this.tabItemCorrespondence.untieTabAndItemByTabId(tabId)
      await chrome.tabs.remove(tabId)
    }
  }

  dumpCurrentState() {
    this.tabItemCorrespondence.dumpCurrentState()
  }
}

type TreeifyClipboard = DiscriminatedUnion<{
  CopyForTransclude: {
    selectedItemPaths: List<ItemPath>
  }
}>
