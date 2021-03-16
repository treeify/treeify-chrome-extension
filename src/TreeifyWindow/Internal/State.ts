import {List} from 'immutable'
import {integer, ItemId, ItemType} from 'src/Common/basicType'
import {DomishObject} from 'src/Common/DomishObject'
import {Timestamp} from 'src/Common/Timestamp'
import {Command} from 'src/TreeifyWindow/Internal/Command'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'

/** Treeifyの状態全体を表すオブジェクトの型 */
export type State = {
  /** キーの型はItemIdと書きたいが、TypeScriptの仕様上numberとしか書けない */
  items: {[itemId: number]: Item}
  textItems: {[itemId: number]: TextItem}
  webPageItems: {[itemId: number]: WebPageItem}
  pages: {[itemId: number]: Page}
  /**
   * マウントされているページたちのアイテムID。
   * 今のところ順序に意味はないが将来的に使うかもしれないし、JSONとの相性も考えてSet型ではなくList型とする。
   * 新しくマウントされたらリストの末尾に追加される。
   */
  mountedPageIds: List<ItemId>
  nextNewItemId: ItemId
  activePageId: ItemId
  /**
   * キーボードやマウスでの入力とコマンドの対応付け。
   * キーの型はInputIdと書きたいが、TypeScriptの仕様上stringとしか書けない。
   */
  itemTreeInputBinding: {[inputId: string]: Command}
}

/**
 * 全てのアイテムが共通で持つデータの型。
 * つまり、ItemTypeによらず各アイテムが必ず持っているデータ。
 */
export type Item = {
  itemId: ItemId
  itemType: ItemType
  childItemIds: List<ItemId>
  parentItemIds: List<ItemId>
  isFolded: boolean
  /** 足跡表示機能で使われるタイムスタンプ */
  timestamp: Timestamp
  cssClasses: List<string>
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
}

/** テキストアイテムのcontenteditableにおけるキャレット位置やテキスト選択範囲を表す型 */
export type TextItemSelection = {
  /**
   * getSelectionで取得できるfocusNode&focusOffsetの位置を表す値。
   * contenteditableな要素の先頭からfocus位置までの文字数（改行を含む）。
   */
  focusDistance: integer
  /**
   * getSelectionで取得できるanchorNode&anchorOffsetの位置を表す値。
   * contenteditableな要素の先頭からanchor位置までの文字数（改行を含む）。
   */
  anchorDistance: integer
}

export namespace State {
  /** StateからJSON文字列を生成する */
  export function toJsonString(state: State): string {
    return JSON.stringify(state, replacer)
  }

  function replacer(this: any, key: string, value: any): any {
    if (value instanceof List) {
      return (value as List<unknown>).toArray()
    }
    return value
  }

  /**
   * JSON文字列からStateオブジェクトを生成する。
   * パースやバリデーションに失敗したらundefinedを返す。
   */
  export function fromJsonString(jsonString: string): State | undefined {
    try {
      const object = JSON.parse(jsonString, (key, value) => {
        if (value instanceof Array) {
          return List(value as Array<undefined>)
        }
        return value
      })
      // TODO: バリデーションなど
      return object
    } catch {
      return undefined
    }
  }
}
