import {List} from 'immutable'
import {ItemId, ItemType} from 'src/Common/basicType'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {Timestamp} from 'src/Common/Timestamp'
import {Command} from 'src/TreeifyWindow/Internal/Command'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'

/** Treeifyの状態全体を表すオブジェクトの型 */
export type State = {
  items: {[K in ItemId]: Item}
  textItems: {[K in ItemId]: TextItem}
  webPageItems: {[K in ItemId]: WebPageItem}
  pages: {[K in ItemId]: Page}
  /**
   * マウントされているページたちのアイテムID。
   * 今のところ順序に意味はないが将来的に使うかもしれないし、JSONとの相性も考えてSet型ではなくList型とする。
   * 新しくマウントされたらリストの末尾に追加される。
   */
  mountedPageIds: List<ItemId>
  /** 削除され再利用されるアイテムID群 */
  availableItemIds: List<ItemId>
  nextNewItemId: ItemId
  activePageId: ItemId
  /** アイテムツリー領域におけるキーボード入力とコマンドの対応付け */
  itemTreeInputBinding: {[K in InputId]: Command}
  /** 非nullならウェブページアイテムのタイトル設定ダイアログが表示される */
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialog | null
  /** フローティング型の左サイドバーを表示中かどうか */
  isFloatingLeftSidebarShown: boolean
}

/**
 * 全てのアイテムが共通で持つデータの型。
 * つまり、ItemTypeによらず各アイテムが必ず持っているデータ。
 */
export type Item = {
  itemId: ItemId
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
}

/** ウェブページアイテムのタイトル設定ダイアログが固有で持つ状態の型 */
export type WebPageItemTitleSettingDialog = {
  /** 対象となるアイテムのDOM要素のgetBoundingClientRect()の結果 */
  targetItemRect: DOMRect
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
}
