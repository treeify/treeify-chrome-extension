import {List, Set} from 'immutable'
import {assertNeverType} from 'src/Common/Debug/assert'
import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyTab/Internal/DomishObject'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {UnigramSearchIndex} from 'src/TreeifyTab/Internal/SearchEngine/UnigramSearchIndex'
import {State} from 'src/TreeifyTab/Internal/State'

/** Treeifyの項目を検索するための全文検索エンジン */
export class SearchEngine {
  readonly unigramSearchIndex: UnigramSearchIndex

  constructor(state: State) {
    const unigramSearchIndex = new UnigramSearchIndex()
    // 各アイテムに含まれるテキストを抽出・unigram化し、検索インデックスに登録する
    for (let itemKey in state.items) {
      const itemId = parseInt(itemKey)
      for (const unigram of SearchEngine.appearingUnigrams(itemId, state)) {
        unigramSearchIndex.addItemId(unigram, itemId)
      }
    }
    this.unigramSearchIndex = unigramSearchIndex
  }

  /** 全文検索を行う */
  search(searchQuery: string): List<ItemId> {
    return List(this.unigramSearchIndex.search(searchQuery)).filter((itemId) => {
      // 除外アイテムで検索結果をフィルタリングする
      if (CurrentState.shouldBeHidden(itemId)) return false

      const textTracks = SearchEngine.getTextTracks(itemId, Internal.instance.state)
      return textTracks.some((textTrack) => {
        // 大文字・小文字を区別せず検索する
        return UnigramSearchIndex.normalize(textTrack).includes(
          UnigramSearchIndex.normalize(searchQuery)
        )
      })
    })
  }

  /**
   * 指定されたアイテムのテキストトラックの変化に合わせて検索インデックスを更新する。
   * アイテム内のテキストを更新する処理は全て第2引数の関数内で行うべし。
   */
  updateSearchIndex(itemId: ItemId, f: () => void) {
    const oldUnigrams = SearchEngine.appearingUnigrams(itemId, Internal.instance.state)
    f()
    const newUnigrams = SearchEngine.appearingUnigrams(itemId, Internal.instance.state)

    for (const unigram of oldUnigrams.subtract(newUnigrams)) {
      this.unigramSearchIndex.removeItemId(unigram, itemId)
    }
    for (const unigram of newUnigrams.subtract(oldUnigrams)) {
      this.unigramSearchIndex.addItemId(unigram, itemId)
    }
  }

  /** 指定されたアイテムが持っている検索可能テキストデータ（Treeifyではテキストトラックと呼ぶ）のリストを返す */
  static getTextTracks(itemId: ItemId, state: State): List<string> {
    const itemType = state.items[itemId].itemType
    switch (itemType) {
      case ItemType.TEXT:
        return List.of(DomishObject.toPlainText(state.textItems[itemId].domishObjects))
      case ItemType.WEB_PAGE:
        const webPageItem = state.webPageItems[itemId]
        return List.of(webPageItem.tabTitle, webPageItem.title ?? '')
      case ItemType.IMAGE:
        return List.of(state.imageItems[itemId].caption)
      case ItemType.CODE_BLOCK:
        const codeBlockItem = state.codeBlockItems[itemId]
        return List.of(codeBlockItem.code)
      case ItemType.TEX:
        const texItem = state.texItems[itemId]
        return List.of(texItem.code)
      default:
        assertNeverType(itemType)
    }
  }

  /** 指定されたアイテムのテキストトラックに含まれる文字の集合を返す */
  static appearingUnigrams(itemId: ItemId, state: State): Set<string> {
    return Set(this.getTextTracks(itemId, state).join(''))
  }
}
