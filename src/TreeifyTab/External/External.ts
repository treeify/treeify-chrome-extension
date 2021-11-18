import { List } from 'immutable'
import md5 from 'md5'
import { integer } from 'src/Common/integer'
import { ItemId, TabId } from 'src/TreeifyTab/basicType'
import { DataFolder } from 'src/TreeifyTab/External/DataFolder'
import { Dialog } from 'src/TreeifyTab/External/DialogState'
import { TabItemCorrespondence } from 'src/TreeifyTab/External/TabItemCorrespondence'
import { Chunk, ChunkId } from 'src/TreeifyTab/Internal/Chunk'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { State } from 'src/TreeifyTab/Internal/State'

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

  /** 独自クリップボード */
  treeifyClipboard: TreeifyClipboard | undefined

  /** アンロードのために閉じられる途中のタブのIDの集合 */
  readonly tabIdsToBeClosedForUnloading = new Set<TabId>()

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

  dumpCurrentState() {
    this.tabItemCorrespondence.dumpCurrentState()
  }
}

type TreeifyClipboard = {
  selectedItemPaths: List<ItemPath>
}
