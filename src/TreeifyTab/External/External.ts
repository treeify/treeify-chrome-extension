import {List} from 'immutable'
import md5 from 'md5'
import {integer} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyTab/basicType'
import {DataFolder} from 'src/TreeifyTab/External/DataFolder'
import {TabItemCorrespondence} from 'src/TreeifyTab/External/TabItemCorrespondence'
import {Chunk, ChunkId} from 'src/TreeifyTab/Internal/Chunk'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {State} from 'src/TreeifyTab/Internal/State'

/** TODO: コメント */
export class External {
  private static _instance: External | undefined

  /** データフォルダ */
  dataFolder: DataFolder | undefined
  /** データフォルダに書き込むべきChunkId群 */
  pendingMutatedChunkIds = new Set<ChunkId>()
  /** Undo用 */
  prevPendingMutatedChunkIds: Set<ChunkId> | undefined

  /** フローティング型の左サイドバーを表示するべきかどうか */
  shouldFloatingLeftSidebarShown: boolean = false

  /**
   * 独自コンテキストメニューを表示する座標を決定するために使う。
   * event.clientXおよびclientYが代入される。
   */
  mousePosition: {x: integer; y: integer} | undefined

  /** ブラウザのタブとTreeifyのウェブページアイテムを紐付けるためのオブジェクト */
  readonly tabItemCorrespondence = new TabItemCorrespondence()

  lastFocusedWindowId: integer = undefined as any

  /** 既存のウェブページアイテムに対応するタブを開いた際、タブ作成イベントリスナーでアイテムIDと紐付けるためのMap */
  readonly urlToItemIdsForTabCreation = new Map<string, List<ItemId>>()

  /** 独自クリップボード */
  treeifyClipboard: TreeifyClipboard | undefined

  /**
   * ハードアンロードによってタブを閉じられる途中のタブIDの集合。
   * chrome.tabs.onRemovedイベント時に、タブがアンロード由来で閉じられたのかを判定するために用いる。
   */
  readonly hardUnloadedTabIds = new Set<integer>()

  private constructor() {}

  /** シングルトンインスタンスを取得する */
  static get instance(): External {
    if (this._instance === undefined) {
      this._instance = new External()
    }
    return this._instance
  }

  /** シングルトンインスタンスを破棄する */
  static cleanup() {
    this._instance = undefined
  }

  onMutateState(propertyPath: PropertyPath) {
    if (this.dataFolder === undefined) return

    // データフォルダへの差分書き込みの対象箇所を伝える
    this.pendingMutatedChunkIds.add(Chunk.convertToChunkId(propertyPath))
  }

  getTreeifyClipboardHash(): string | undefined {
    if (this.treeifyClipboard === undefined) return undefined

    const jsonString = JSON.stringify(this.treeifyClipboard, State.jsonReplacer)
    return md5(jsonString)
  }

  dumpCurrentState() {
    this.tabItemCorrespondence.dumpCurrentState()
  }
}

type TreeifyClipboard = {
  selectedItemPaths: List<ItemPath>
}
