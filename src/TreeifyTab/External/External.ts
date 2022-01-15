import { DefaultMap, MultiSet } from 'mnemonist'
import { ItemId } from 'src/TreeifyTab/basicType'
import { DataFolder } from 'src/TreeifyTab/External/DataFolder'
import { DialogState } from 'src/TreeifyTab/External/DialogState'
import { TabItemCorrespondence } from 'src/TreeifyTab/External/TabItemCorrespondence'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { TabId } from 'src/Utility/browser'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { DiscriminatedUnion } from 'src/Utility/DiscriminatedUnion'
import { RArray } from 'src/Utility/fp-ts'
import { integer } from 'src/Utility/integer'

/** TODO: コメント */
export class External {
  static #instance: External | undefined

  dialogState: DialogState | undefined

  dataFolder: DataFolder | undefined

  /**
   * 前回の同期以降にStateが更新されたかどうか
   * TODO: この変数は本来は永続化されるべき。再起動時点で同期済みかどうかは状況次第なので。
   */
  hasUpdatedSinceSync = true

  /**
   * バックグラウンドでダウンロードしているデータファイルの情報。
   * 現在はGoogle Driveのみを想定した設計になっている。
   */
  backgroundDownload: { modifiedTime: string; promise: Promise<State> } | undefined

  /** ブラウザのタブとTreeifyのウェブページ項目を紐付けるためのオブジェクト */
  readonly tabItemCorrespondence = new TabItemCorrespondence()

  lastFocusedWindowId: integer = undefined as any

  /** 既存のウェブページ項目に対応するタブを開いた際、タブ作成イベントリスナーで項目IDと紐付けるためのMap */
  readonly urlToItemIdsForTabCreation = new DefaultMap<string, RArray<ItemId>>(() => [])

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

  onMutateState(statePath: StatePath) {
    this.hasUpdatedSinceSync = true
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
    const tab = this.tabItemCorrespondence.getTab(tabId)
    assertNonUndefined(tab)
    this.tabItemCorrespondence.untieTabAndItemByTabId(tabId)
    if (!tab.discarded) {
      // タブを強制的に閉じる処理を開始する
      const url = tab.url ?? ''
      this.forceClosingTabUrls.add(url)
      const discardedTab = await chrome.tabs.discard(tabId)
      assertNonUndefined(discardedTab.id)
      await chrome.tabs.remove(discardedTab.id)
      this.forceClosingTabUrls.remove(url)
    } else {
      await chrome.tabs.remove(tabId)
    }
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
