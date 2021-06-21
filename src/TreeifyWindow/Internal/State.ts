import {is, List} from 'immutable'
import {assert, assertNeverType, assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemId, ItemType, TOP_ITEM_ID, WorkspaceId} from 'src/TreeifyWindow/basicType'
import {Command} from 'src/TreeifyWindow/Internal/Command'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {Timestamp} from 'src/TreeifyWindow/Timestamp'

/** Treeifyの状態全体を表すオブジェクトの型 */
export type State = {
  items: {[K in ItemId]: Item}
  textItems: {[K in ItemId]: TextItem}
  webPageItems: {[K in ItemId]: WebPageItem}
  imageItems: {[K in ItemId]: ImageItem}
  codeBlockItems: {[K in ItemId]: CodeBlockItem}
  pages: {[K in ItemId]: Page}
  workspaces: {[K in WorkspaceId]: Workspace}
  /**
   * マウントされているページたちのアイテムID。
   * 並び順はアクティブ化された順（アクティブページが末尾）
   */
  mountedPageIds: List<ItemId>
  /** 削除され再利用されるアイテムID群 */
  availableItemIds: List<ItemId>
  maxItemId: ItemId
  /** アイテムツリー領域におけるキーボード入力とコマンドの対応付け */
  itemTreeKeyboardBinding: {[K in InputId]: List<Command>}
  /** アイテムツリーの削除ボタンのマウス入力とコマンドの対応付け */
  itemTreeDeleteButtonMouseBinding: {[K in InputId]: List<Command>}
  /** 各ダイアログの状態 */
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialog | null
  codeBlockItemEditDialog: CodeBlockItemEditDialog | null
  defaultWindowModeSettingDialog: DefaultWindowModeSettingDialog | null
  workspaceDialog: WorkspaceDialog | null
  labelEditDialog: LabelEditDialog | null
  otherParentsDialog: OtherParentsDialog | null
  searchDialog: SearchDialog | null
}

/**
 * 全てのアイテムが共通で持つデータの型。
 * つまり、ItemTypeによらず各アイテムが必ず持っているデータ。
 */
export type Item = {
  itemType: ItemType
  childItemIds: List<ItemId>
  parents: {[K in ItemId]: Edge}
  /** 足跡表示機能で使われるタイムスタンプ */
  timestamp: Timestamp
  /**
   * このアイテムにアドホックに付与されるCSSクラスのリスト。
   * 付与されたアイテム本体とその子孫に別々のスタイルを適用できるよう、
   * 子孫側には末尾に"-children"を追加したCSSクラスを付与する。
   */
  cssClasses: List<string>
}

export type Edge = {
  /**
   * 折りたたみ状態か展開状態かのフラグ。
   *
   * 【ItemではなくEdgeで持つ理由】
   * トランスクルードされたアイテムのisCollapsedを変更しても、他の視座に影響を与えずに済む。
   * アクティブページを表示する際に、そのページがisCollapsedかどうかを気にせず済む。
   * 正直、具体的なメリットはこれくらいしか思いつかない。
   * リスクはあるが直感的に面白そうなこちらに賭けてみた。
   */
  isCollapsed: boolean

  /**
   * いわゆる意味ネットワークのように、エッジが持つラベルのデータ。
   * List型なので複数設定できる。List内の並び順がそのまま画面表示上の並び順として使われる。
   */
  labels: List<string>
}
export function createDefaultEdge(): Edge {
  return {isCollapsed: false, labels: List.of()}
}

/** テキストアイテムが固有で持つデータの型 */
export type TextItem = {
  domishObjects: List<DomishObject>
}

/** ウェブページアイテムが固有で持つデータの型 */
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
   * nullの場合はtabTitleがこのウェブページアイテムのタイトルとして扱われる。
   */
  title: string | null
  /** 未読フラグ */
  isUnread: boolean
}

/** 画像アイテムが固有で持つデータの型 */
export type ImageItem = {
  url: string
  caption: string
}

/** コードブロックアイテムが固有で持つデータの型 */
export type CodeBlockItem = {
  code: string
  language: string
}

/** 各ページが持つデータの型 */
export type Page = {
  /** アイテムツリー内で操作対象となるアイテム */
  targetItemPath: ItemPath
  /**
   * アイテム複数選択時の範囲の一端。
   * テキスト選択におけるanchorと同じ意味合い。
   */
  anchorItemPath: ItemPath
  /** このページのデフォルトのウィンドウモード */
  defaultWindowMode: DefaultWindowMode
}

export type Workspace = {
  /**
   * このワークスペースでページツリーや検索結果から除外したいアイテム群。
   * これに含まれるアイテムまたはその子孫アイテムはページツリーや検索結果から除外される。
   */
  excludedItemIds: List<ItemId>
  name: string
}

/**
 * 'keep'の場合、ウィンドウモードの自動変更は行わない。
 * 'inherit'の場合、親ページのデフォルトウィンドウモードを再帰的に参照する。
 */
export type DefaultWindowMode = 'dual' | 'full' | 'floating' | 'keep' | 'inherit'

/** ウェブページアイテムのタイトル設定ダイアログが固有で持つ状態の型 */
export type WebPageItemTitleSettingDialog = {
  /** 対象となるアイテムのDOM要素のgetBoundingClientRect()の結果 */
  targetItemRect: DOMRect
}

/** コードブロックアイテム編集ダイアログが持つ内部状態の型 */
export type CodeBlockItemEditDialog = {
  code: string
  language: string
}

/** デフォルトウィンドウモード設定ダイアログが持つ内部状態の型 */
export type DefaultWindowModeSettingDialog = {}

export type WorkspaceDialog = {}

/** ラベル編集ダイアログが持つ内部状態の型 */
export type LabelEditDialog = {
  labels: List<string>
}

export type OtherParentsDialog = {}

export type SearchDialog = {}

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

  /** Stateオブジェクトを複製する。Undo機能のために必要 */
  export function clone(state: State): State {
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

        // TODO: 子リストに重複がないことのチェック

        // 親子関係の対応チェック（エッジの存在チェック）
        // 子アイテムの親マップに自身が含まれていることのチェック
        for (const childItemId of item.childItemIds) {
          assertNonUndefined(
            state.items[childItemId].parents[itemId],
            `items[${childItemId}]のparentsに${itemId}が無い`
          )
        }
        // 親アイテムの子リストに自身が含まれていることのチェック
        for (const parentsKey in item.parents) {
          const parentItemId = parseInt(parentsKey)
          assert(
            state.items[parentItemId].childItemIds.contains(itemId),
            `items[${parentItemId}]のchildItemIdsに${itemId}が含まれていない`
          )

          // TODO: Edgeの検証
        }

        // itemTypeに対応するオブジェクトの存在チェック（ついでにitemTypeの型チェック）
        switch (item.itemType) {
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
          default:
            assertNeverType(item.itemType, `items[${itemId}]の不明なitemType "${item.itemType}"`)
        }

        // 残りのプロパティの型チェック（存在チェックを兼ねる）
        assert(typeof item.timestamp === 'number', `items[${itemId}]のtimestampの型エラー`)
        // TODO: 各要素の型チェックまではしていない
        assert(item.cssClasses instanceof List, `items[${itemId}]のcssClassesの型エラー`)
      }

      for (const pagesKey in state.pages) {
        const pageId = parseInt(pagesKey)
        // ページIDに対応するアイテムIDの存在チェック
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

        // TODO: page.defaultWindowModeの型チェック
      }

      assert(typeof state.maxItemId === 'number', `maxItemIdの型エラー`)
      const maxItemId = List(itemIds).concat(state.availableItemIds).max() ?? TOP_ITEM_ID
      assert(maxItemId === state.maxItemId, `maxItemIdが実際の最大itemId ${maxItemId}と異なる`)

      for (const availableItemId of state.availableItemIds) {
        assert(
          state.items[availableItemId] === undefined,
          `items[${availableItemId}]が存在するが、これはavailableItemIdsに含まれる値`
        )
        assert(
          availableItemId < state.maxItemId,
          `availableItemId ${availableItemId}がmaxItemId未満でない`
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
        state.mountedPageIds.toSet().size === state.mountedPageIds.size,
        `mountedPageIdsに重複がある`
      )
      assert(!state.mountedPageIds.isEmpty(), `mountedPageIdsが空である`)

      // TODO: ダイアログなど、残りのプロパティのチェック

      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }
}
