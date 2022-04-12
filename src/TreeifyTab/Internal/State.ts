import { ItemId, ItemType, TOP_ITEM_ID, WorkspaceId } from 'src/TreeifyTab/basicType'
import { GlobalItemId } from 'src/TreeifyTab/Instance'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { commandNames } from 'src/TreeifyTab/View/commandNames'
import { assert, assertNeverType, assertNonUndefined } from 'src/Utility/Debug/assert'
import { dump } from 'src/Utility/Debug/logger'
import { NERArray, Option$, RArray, RArray$, RRecord$, RSet, RSet$ } from 'src/Utility/fp-ts'
import { integer } from 'src/Utility/integer'
import { Timestamp } from 'src/Utility/Timestamp'

export const CURRENT_SCHEMA_VERSION = 1 as const

/** Treeifyの状態全体を表すオブジェクトの型 */
export type State = {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION
  items: Record<ItemId, Item>
  textItems: Record<ItemId, TextItem>
  webPageItems: Record<ItemId, WebPageItem>
  imageItems: Record<ItemId, ImageItem>
  codeBlockItems: Record<ItemId, CodeBlockItem>
  texItems: Record<ItemId, TexItem>
  pages: Record<ItemId, Page>
  workspaces: Record<WorkspaceId, Workspace>
  /**
   * マウントされているページたちの項目ID。
   * 並び順はアクティブ化された順（アクティブページが末尾）
   */
  mountedPageIds: NERArray<ItemId>
  /** 削除され再利用される項目ID群 */
  vacantItemIds: RArray<ItemId>
  maxItemId: ItemId
  /** メインエリアにおけるキーボード入力とコマンドの対応付け */
  mainAreaKeyBindings: Record<InputId, RArray<CommandId>>
  customCss: string
  languageScoreOffsets: Record<string, number>
  exportSettings: {
    selectedFormat: ExportFormat
    options: {
      [ExportFormat.PLAIN_TEXT]: {
        includeInvisibleItems: boolean
        indentationUnit: string
      }
      [ExportFormat.MARKDOWN]: {
        includeInvisibleItems: boolean
        minimumHeaderLevel: integer
        useImgTag: boolean
      }
      [ExportFormat.OPML]: {
        includeInvisibleItems: boolean
      }
    }
  }
  selectedReplacementRange: ReplacementRange
  leftEndMouseGestureEnabled: boolean
  rightEndMouseGestureEnabled: boolean
  useClipboardTextWhenQuoting: boolean
}

/**
 * 全ての項目が共通で持つデータの型。
 * つまり、ItemTypeによらず各項目が必ず持っているデータ。
 */
export type Item = {
  type: ItemType
  globalItemId: GlobalItemId
  childItemIds: RArray<ItemId>
  parents: Record<ItemId, Edge>
  /** 足跡表示機能で使われるタイムスタンプ */
  timestamp: Timestamp
  /**
   * この項目にアドホックに付与されるCSSクラスのリスト。
   * 付与された項目本体とその子孫に別々のスタイルを適用できるよう、
   * 子孫側には末尾に"-children"を追加したCSSクラスを付与する。
   */
  cssClasses: RArray<string>
  source: Source | null
}

export type Edge = {
  /**
   * 折りたたみ状態か展開状態かのフラグ。
   *
   * 【ItemではなくEdgeで持つ理由】
   * トランスクルードされた項目のisFoldedを変更しても、他の視座に影響を与えずに済む。
   * アクティブページを表示する際に、そのページがisFoldedかどうかを気にせず済む。
   * 正直、具体的なメリットはこれくらいしか思いつかない。
   * リスクはあるが直感的に面白そうなこちらに賭けてみた。
   */
  isFolded: boolean
}

export function createDefaultEdge(): Edge {
  return { isFolded: false }
}

export type Source = {
  title: string
  url: string
}

/** テキスト項目が固有で持つデータの型 */
export type TextItem = {
  domishObjects: RArray<DomishObject>
}

/** ウェブページ項目が固有で持つデータの型 */
export type WebPageItem = {
  url: string
  /**
   * ファビコンのURL。
   * 指定なしの場合は空文字列。
   * アンロード後もファビコンを表示するために、このオブジェクトで保持する。
   */
  faviconUrl: string
  /**
   * タブのタイトル。
   * アンロード後もタイトルを表示するために、このオブジェクトで保持する。
   */
  tabTitle: string
  /**
   * タブのタイトルを上書き表示するためのタイトル。
   * nullの場合はtabTitleがこのウェブページ項目のタイトルとして扱われる。
   */
  title: string | null
  /** 未読フラグ */
  isUnread: boolean
}

/** 画像項目が固有で持つデータの型 */
export type ImageItem = {
  url: string
  caption: string
  originalSize: SizePx | null
  /** 画像の表示領域の幅指定 */
  widthPx: integer | null
}

export type SizePx = {
  widthPx: integer
  heightPx: integer
}

/** コードブロック項目が固有で持つデータの型 */
export type CodeBlockItem = {
  code: string
  language: string
  caption: string
}

/** TeX項目が固有で持つデータの型 */
export type TexItem = {
  code: string
  caption: string
}

/** 各ページが持つデータの型 */
export type Page = {
  /**
   * 操作の対象になる項目を表す。
   * 項目を複数選択中はその範囲の一端を表す。
   * Shift+クリック時やShift+↓キー押下時はanchorItemPathは変化せず、targetItemPathのみが変化する。
   */
  targetItemPath: ItemPath
  /**
   * 項目を複数選択中にその範囲の一端を表す。
   * 単一項目を選択中はtargetItemPathと同じ値になる。
   * Shift+クリック時やShift+↓キー押下時はanchorItemPathは変化せず、targetItemPathのみが変化する。
   */
  anchorItemPath: ItemPath
}

export type Workspace = {
  name: string
  activePageId: ItemId
  /**
   * このワークスペースでページツリーや検索結果から除外したい項目群。
   * これに含まれる項目またはその子孫項目はページツリーや検索結果から除外される。
   */
  excludedItemIds: RArray<ItemId>
  searchHistory: RArray<string>
}

export type CommandId = keyof typeof commandNames

/** エクスポートダイアログで選べるフォーマットの一覧 */
export enum ExportFormat {
  PLAIN_TEXT = 'Plain text',
  MARKDOWN = 'Markdown',
  OPML = 'OPML',
}

export const REPLACEMENT_RANGES = ['all-pages', 'active-page-and-descendants'] as const
export type ReplacementRange = typeof REPLACEMENT_RANGES[number]

export namespace State {
  /** Stateオブジェクトまたはそのサブオブジェクトを複製する。Undo機能のために必要 */
  export function clone<T>(state: T): T {
    if (state === undefined) return undefined as unknown as T

    // 最適化の余地ありかも
    return JSON.parse(JSON.stringify(state))
  }

  /**
   * 2つのStateのどちらの方が新しい（先に進んでいる）かを判定する。
   * 編集、作成、削除した項目の数が多い方のStateが新しいと判定される。
   * 計算結果が等しい場合はfalseを返す。
   */
  export function isNewerThan(a: State, b: State, lastSyncedAt: Timestamp): boolean {
    // aが更新した項目のタイムスタンプの配列
    const aUpdatedTimestamps: Timestamp[] = []
    // bが更新した項目のタイムスタンプの配列
    const bUpdatedTimestamps: Timestamp[] = []
    // aにしか存在しない項目のタイムスタンプの配列
    const aOnlyTimestamps: Timestamp[] = []
    // bにしか存在しない項目のタイムスタンプの配列
    const bOnlyTimestamps: Timestamp[] = []
    for (let itemId = 0; itemId <= Math.max(a.maxItemId, b.maxItemId); itemId++) {
      const aTimestamp = a.items[itemId]?.timestamp
      const bTimestamp = b.items[itemId]?.timestamp
      if (aTimestamp !== undefined && bTimestamp !== undefined) {
        if (aTimestamp > bTimestamp) {
          aUpdatedTimestamps.push(aTimestamp)
        } else if (aTimestamp < bTimestamp) {
          bUpdatedTimestamps.push(bTimestamp)
        }
      } else if (aTimestamp !== undefined) {
        aOnlyTimestamps.push(aTimestamp)
      } else if (bTimestamp !== undefined) {
        bOnlyTimestamps.push(bTimestamp)
      }
    }

    // 更新した項目の数
    const aUpdateCount = aUpdatedTimestamps.length
    const bUpdateCount = bUpdatedTimestamps.length
    // 作成した項目の数
    let aCreateCount = 0
    let bCreateCount = 0
    // 削除した項目の数
    let aDeleteCount = 0
    let bDeleteCount = 0
    for (const aOnlyTimestamp of aOnlyTimestamps) {
      if (aOnlyTimestamp > lastSyncedAt) {
        aCreateCount++
      } else {
        bDeleteCount++
      }
    }
    for (const bOnlyTimestamp of bOnlyTimestamps) {
      if (bOnlyTimestamp > lastSyncedAt) {
        bCreateCount++
      } else {
        aDeleteCount++
      }
    }

    dump(aUpdateCount, aCreateCount, aDeleteCount)
    dump(bUpdateCount, bCreateCount, bDeleteCount)
    const aScore = aUpdateCount + aCreateCount + aDeleteCount
    const bScore = bUpdateCount + bCreateCount + bDeleteCount
    return aScore > bScore
  }

  /**
   * Stateオブジェクトの整合性をチェックする。
   * 不整合を検出した場合、最初に見つかった不整合の内容をconsoleに出力する。
   */
  export function isValid(state: State): boolean {
    try {
      const itemIds = RRecord$.numberKeys(state.items)
      for (const itemId of itemIds) {
        const item = state.items[itemId]

        // 子リストに重複がないことのチェック
        assert(
          item.childItemIds.length === RSet$.from(item.childItemIds).size,
          `items[${itemId}]のchildItemIdsに重複がある`
        )

        // 親子関係の対応チェック（エッジの存在チェック）
        // 子項目の親マップに自身が含まれていることのチェック
        for (const childItemId of item.childItemIds) {
          assertNonUndefined(
            state.items[childItemId]?.parents?.[itemId],
            `items[${childItemId}]のparentsに${itemId}が無い`
          )
        }
        // 親項目の子リストに自身が含まれていることのチェック
        for (const parentItemId of RRecord$.numberKeys(item.parents)) {
          assert(
            state.items[parentItemId]?.childItemIds?.includes(itemId),
            `items[${parentItemId}]のchildItemIdsに${itemId}が含まれていない`
          )

          // TODO: Edgeの検証
        }

        // itemTypeに対応するオブジェクトの存在チェック（ついでにitemTypeの型チェック）
        switch (item.type) {
          case ItemType.TEXT:
            assertNonUndefined(state.textItems[itemId], `textItems[${itemId}]が存在しない`)
            break
          case ItemType.WEB_PAGE:
            assertNonUndefined(state.webPageItems[itemId], `webPageItems[${itemId}]が存在しない`)
            break
          case ItemType.IMAGE:
            assertNonUndefined(state.imageItems[itemId], `imageItems[${itemId}]が存在しない`)
            break
          case ItemType.CODE_BLOCK:
            assertNonUndefined(
              state.codeBlockItems[itemId],
              `codeBlockItems[${itemId}]が存在しない`
            )
            break
          case ItemType.TEX:
            assertNonUndefined(state.texItems[itemId], `texItems[${itemId}]が存在しない`)
            break
          default:
            assertNeverType(item.type, `items[${itemId}]の不明なitemType "${item.type}"`)
        }

        // 残りのプロパティの型チェック（存在チェックを兼ねる）
        assert(typeof item.timestamp === 'number', `items[${itemId}]のtimestampの型エラー`)
      }

      // 循環参照が存在しないことの確認
      assert(
        !hasCycle(state, TOP_ITEM_ID, new Set()),
        'トランスクルードによって循環参照が発生している'
      )

      for (const pageId of RRecord$.numberKeys(state.pages)) {
        // ページIDに対応する項目IDの存在チェック
        assertNonUndefined(
          state.items[pageId],
          `${pageId}がpagesに含まれているのにitemsには含まれていない`
        )

        const page = state.pages[pageId]
        assert(
          RArray$.shallowEqual(RArray$.pop(page.targetItemPath), RArray$.pop(page.anchorItemPath)),
          `pages[${pageId}]のtargetItemPathとanchorItemPathが兄弟でない`
        )
        // TODO: targetItemPath, anchorItemPathがvalidなItemPathであることのチェック
        page.targetItemPath
      }

      assert(typeof state.maxItemId === 'number', `maxItemIdの型エラー`)
      const maxItemId = Option$.get(TOP_ITEM_ID)(RArray$.max(itemIds.concat(state.vacantItemIds)))
      assert(maxItemId === state.maxItemId, `maxItemIdが実際の最大itemId ${maxItemId}と異なる`)

      for (const vacantItemId of state.vacantItemIds) {
        assert(
          state.items[vacantItemId] === undefined,
          `items[${vacantItemId}]が存在するが、これはvacantItemIdsに含まれる値`
        )
        assert(
          vacantItemId <= state.maxItemId,
          `vacantItemId ${vacantItemId}がmaxItemIdを超えている`
        )
      }

      for (const workspaceId of RRecord$.numberKeys(state.workspaces)) {
        const workspace = state.workspaces[workspaceId]
        assert(typeof workspace.name === 'string', `workspaces[${workspaceId}]のnameの型エラー`)

        for (const excludedItemId of workspace.excludedItemIds) {
          assertNonUndefined(
            state.items[excludedItemId],
            `workspaces[${workspaceId}]のexcludedItemId ${excludedItemId}がitemsに存在しない`
          )
        }
      }

      for (const mountedPageId of state.mountedPageIds) {
        assertNonUndefined(
          state.pages[mountedPageId],
          `mountedPageId ${mountedPageId}がpagesに含まれていない`
        )
      }
      assert(
        RSet$.from(state.mountedPageIds).size === state.mountedPageIds.length,
        `mountedPageIdsに重複がある`
      )
      assert(state.mountedPageIds.length > 0, `mountedPageIdsが空である`)

      // TODO: ダイアログなど、残りのプロパティのチェック

      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  /**
   * State内でItemIdによって指し示されている項目が実在するかどうかを調べる。
   * 実在しない場合はその参照を削除する。
   */
  export function removeBrokenReferences(state: State) {
    for (const itemId of RRecord$.numberKeys(state.items)) {
      const item = state.items[itemId]

      // 子リスト内の重複を削除
      if (item.childItemIds.length !== RSet$.from(item.childItemIds).size) {
        item.childItemIds = RArray$.from(RSet$.from(item.childItemIds))
      }

      // 存在しない子項目への参照を削除
      item.childItemIds = item.childItemIds.filter((childItemId) => {
        return state.items[childItemId] !== undefined
      })

      // 存在しない親項目への参照を削除
      for (const parentItemId of RRecord$.numberKeys(item.parents)) {
        if (state.items[parentItemId] === undefined) {
          delete item.parents[parentItemId]
        }
      }
    }

    state.vacantItemIds = state.vacantItemIds.filter((vacantItemId) => {
      return state.items[vacantItemId] !== undefined
    })

    state.mountedPageIds = state.mountedPageIds.filter((mountedPageId) => {
      return state.items[mountedPageId] !== undefined
    }) as any
  }

  /** Top項目から辿れない項目を返す */
  export function detectUnreachableItems(state: State): RArray<ItemId> {
    // Top項目から辿れる項目ID
    const itemIds = RSet$.from(yieldSubtreeItemIds(state, TOP_ITEM_ID))

    return RRecord$.numberKeys(state.items).filter(
      (itemId) => !itemIds.has(itemId) && state.items[itemId] !== undefined
    )
  }

  /**
   * Backspace, Deleteキーでのテキスト項目結合時に項目が正しく削除されない不具合でState内に残っている項目データを削除するための関数。
   * この不具合は1.0.0で発生しており、1.0.1では発生しないよう修正されたが壊れたStateはそのままだった。
   */
  export function deleteUnreachableItem(itemId: ItemId, state: State) {
    // 項目データをまるごと削除する前に、親子関係の整合性を保つためにエッジを削除
    for (const childItemId of state.items[itemId].childItemIds) {
      delete state.items[childItemId].parents[itemId]
    }
    for (const parentItemId of RRecord$.numberKeys(state.items[itemId].parents)) {
      const parentItem = state.items[parentItemId]
      parentItem.childItemIds = RArray$.remove(itemId)(parentItem.childItemIds)
    }

    // 項目タイプごとのデータを削除する
    const itemType = state.items[itemId].type
    switch (itemType) {
      case ItemType.TEXT:
        delete state.textItems[itemId]
        break
      case ItemType.WEB_PAGE:
        delete state.webPageItems[itemId]
        break
      case ItemType.IMAGE:
        delete state.imageItems[itemId]
        break
      case ItemType.CODE_BLOCK:
        delete state.codeBlockItems[itemId]
        break
      case ItemType.TEX:
        delete state.texItems[itemId]
        break
      default:
        assertNeverType(itemType)
    }

    delete state.items[itemId]
    delete state.pages[itemId]

    // 除外リストから削除する
    for (const workspace of Object.values(state.workspaces)) {
      workspace.excludedItemIds = RArray$.remove(itemId)(workspace.excludedItemIds)
    }

    state.mountedPageIds = RArray$.remove(itemId)(state.mountedPageIds) as any

    state.vacantItemIds = [...state.vacantItemIds, itemId]
  }

  function* yieldSubtreeItemIds(state: State, itemId: ItemId): Generator<ItemId> {
    yield itemId
    for (const childItemId of state.items[itemId].childItemIds) {
      yield* yieldSubtreeItemIds(state, childItemId)
    }
  }

  // 親子関係のグラフ構造が循環を持っているかどうか判定する。
  // トップページからの深さ優先探索を行う。
  function hasCycle(state: State, itemId: ItemId, stackLike: RSet<ItemId>): boolean {
    if (stackLike.has(itemId)) {
      return true
    }

    for (const childItemId of state.items[itemId].childItemIds) {
      if (hasCycle(state, childItemId, RSet$.add(itemId)(stackLike))) {
        return true
      }
    }
    return false
  }
}
