import { is, List, Set } from 'immutable'
import { ItemId, ItemType, TOP_ITEM_ID, WorkspaceId } from 'src/TreeifyTab/basicType'
import { CURRENT_SCHEMA_VERSION } from 'src/TreeifyTab/External/DataFolder'
import { GlobalItemId } from 'src/TreeifyTab/Instance'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { commandNames } from 'src/TreeifyTab/View/commandNames'
import { assert, assertNeverType, assertNonUndefined } from 'src/Utility/Debug/assert'
import { DiscriminatedUnion } from 'src/Utility/DiscriminatedUnion'
import { NERist, Option, Rist } from 'src/Utility/fp-ts'
import { integer } from 'src/Utility/integer'
import { Timestamp } from 'src/Utility/Timestamp'

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
  reminders: Record<ItemId, List<ReminderSetting>>
  workspaces: Record<WorkspaceId, Workspace>
  /**
   * マウントされているページたちの項目ID。
   * 並び順はアクティブ化された順（アクティブページが末尾）
   */
  mountedPageIds: NERist.T<ItemId>
  /** 削除され再利用される項目ID群 */
  availableItemIds: Rist.T<ItemId>
  maxItemId: ItemId
  /** メインエリアにおけるキーボード入力とコマンドの対応付け */
  mainAreaKeyBindings: Record<InputId, Rist.T<CommandId>>
  customCss: string
  preferredLanguages: Record<string, number>
  exportSettings: {
    selectedFormat: ExportFormat
    options: {
      [ExportFormat.PLAIN_TEXT]: {
        includeInvisibleItems: boolean
        indentationExpression: string
      }
      [ExportFormat.MARKDOWN]: {
        includeInvisibleItems: boolean
        minimumHeaderLevel: integer
      }
      [ExportFormat.OPML]: {
        includeInvisibleItems: boolean
      }
    }
  }
  leftEndMouseGestureEnabled: boolean
  rightEndMouseGestureEnabled: boolean
  syncWith: 'Google Drive' | 'Local'
}

/**
 * 全ての項目が共通で持つデータの型。
 * つまり、ItemTypeによらず各項目が必ず持っているデータ。
 */
export type Item = {
  type: ItemType
  globalItemId: GlobalItemId
  childItemIds: List<ItemId>
  parents: Record<ItemId, Edge>
  /** 足跡表示機能で使われるタイムスタンプ */
  timestamp: Timestamp
  /**
   * この項目にアドホックに付与されるCSSクラスのリスト。
   * 付与された項目本体とその子孫に別々のスタイルを適用できるよう、
   * 子孫側には末尾に"-children"を追加したCSSクラスを付与する。
   */
  cssClasses: Rist.T<string>
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
  domishObjects: List<DomishObject>
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
  /** メインエリア内で操作対象となる項目 */
  targetItemPath: ItemPath
  /**
   * 項目複数選択時の範囲の一端。
   * テキスト選択におけるanchorと同じ意味合い。
   */
  anchorItemPath: ItemPath
}

export type ReminderSetting = DiscriminatedUnion<{
  once: {
    notifiedAt?: Timestamp
    year: integer
    month: integer
    date: integer
    hour: integer
    minute: integer
  }
  ['every month']: {
    notifiedAt?: Timestamp
    date: integer
    hour: integer
    minute: integer
  }
}>

export type Workspace = {
  name: string
  activePageId: ItemId
  /**
   * このワークスペースでページツリーや検索結果から除外したい項目群。
   * これに含まれる項目またはその子孫項目はページツリーや検索結果から除外される。
   */
  excludedItemIds: List<ItemId>
  searchHistory: List<string>
}

export type CommandId = keyof typeof commandNames

/** エクスポートダイアログで選べるフォーマットの一覧 */
export enum ExportFormat {
  PLAIN_TEXT = 'Plain text',
  MARKDOWN = 'Markdown',
  OPML = 'OPML',
}

export namespace State {
  /** Stateに対してJSON.stringifyする際に用いるreplacer */
  export function jsonReplacer(this: any, key: string, value: any): any {
    if (value instanceof List) {
      return (value as List<unknown>).toArray()
    }
    return value
  }

  /** Stateに対してJSON.parseする際に用いるreplacer */
  export function jsonReviver(key: any, value: any) {
    if (value instanceof Array) {
      return List(value as Array<unknown>)
    }
    return value
  }

  /** Stateオブジェクトまたはそのサブオブジェクトを複製する。Undo機能のために必要 */
  export function clone<T>(state: T): T {
    if (state === undefined) return undefined as unknown as T

    // 最適化の余地ありかも
    const json = JSON.stringify(state, jsonReplacer)
    return JSON.parse(json, jsonReviver)
  }

  /**
   * Stateオブジェクトの整合性をチェックする。
   * 不整合を検出した場合、最初に見つかった不整合の内容をconsoleに出力する。
   */
  export function isValid(state: State): boolean {
    try {
      const itemIds = Object.keys(state.items).map((key) => parseInt(key))
      for (const itemId of itemIds) {
        const item = state.items[itemId]

        // 子リストに重複がないことのチェック
        assert(
          item.childItemIds.size === item.childItemIds.toSet().size,
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
        for (const parentsKey in item.parents) {
          const parentItemId = parseInt(parentsKey)
          assert(
            state.items[parentItemId]?.childItemIds?.contains(itemId),
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
      assert(!hasCycle(state, TOP_ITEM_ID, Set()), 'トランスクルードによって循環参照が発生している')

      for (const pagesKey in state.pages) {
        const pageId = parseInt(pagesKey)
        // ページIDに対応する項目IDの存在チェック
        assertNonUndefined(
          state.items[pageId],
          `${pageId}がpagesに含まれているのにitemsには含まれていない`
        )

        const page = state.pages[pageId]
        assert(
          is(page.targetItemPath.pop(), page.anchorItemPath.pop()),
          `pages[${pageId}]のtargetItemPathとanchorItemPathが兄弟でない`
        )
        // TODO: targetItemPath, anchorItemPathがvalidなItemPathであることのチェック
        page.targetItemPath
      }

      assert(typeof state.maxItemId === 'number', `maxItemIdの型エラー`)
      const maxItemId = Option.get(TOP_ITEM_ID)(Rist.max(itemIds.concat(state.availableItemIds)))
      assert(maxItemId === state.maxItemId, `maxItemIdが実際の最大itemId ${maxItemId}と異なる`)

      for (const availableItemId of state.availableItemIds) {
        assert(
          state.items[availableItemId] === undefined,
          `items[${availableItemId}]が存在するが、これはavailableItemIdsに含まれる値`
        )
        assert(
          availableItemId <= state.maxItemId,
          `availableItemId ${availableItemId}がmaxItemIdを超えている`
        )
      }

      for (const workspacesKey in state.workspaces) {
        const workspaceId = parseInt(workspacesKey)
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
        Set(state.mountedPageIds).size === state.mountedPageIds.length,
        `mountedPageIdsに重複がある`
      )
      assert(state.mountedPageIds.length === 0, `mountedPageIdsが空である`)

      // TODO: ダイアログなど、残りのプロパティのチェック

      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  // 親子関係のグラフ構造が循環を持っているかどうか判定する。
  // トップページからの深さ優先探索を行う。
  function hasCycle(state: State, itemId: ItemId, stackLike: Set<ItemId>): boolean {
    if (stackLike.has(itemId)) {
      return true
    }

    for (const childItemId of state.items[itemId].childItemIds) {
      if (hasCycle(state, childItemId, stackLike.add(itemId))) {
        return true
      }
    }
    return false
  }
}
