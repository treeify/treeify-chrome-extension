import {List, Set} from 'immutable'
import {assertNeverType} from 'src/Common/Debug/assert'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {UnigramSearchIndex} from 'src/TreeifyWindow/Internal/SearchEngine/UnigramSearchIndex'
import {State} from 'src/TreeifyWindow/Internal/State'

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
    // TODO: ワークスペースごとの除外アイテムで検索結果をフィルタリングする
    return List(this.unigramSearchIndex.search(searchQuery)).filter((itemId) => {
      const textTracks = SearchEngine.getTextTracks(itemId, Internal.instance.state)
      return textTracks.find((text) => text.includes(searchQuery)) !== undefined
    })
  }

  /** 指定されたアイテムが持っている検索可能テキストデータ（Treeifyではテキストトラックと呼ぶ）のリストを返す */
  static getTextTracks(itemId: ItemId, state: State): List<string> {
    const itemType = state.items[itemId].itemType
    switch (itemType) {
      case ItemType.TEXT:
        return List.of(DomishObject.toPlainText(state.textItems[itemId].domishObjects))
      case ItemType.WEB_PAGE:
        // urlは含めるべきなのだろうか
        const webPageItem = state.webPageItems[itemId]
        return List.of(webPageItem.tabTitle, webPageItem.title ?? '')
      case ItemType.IMAGE:
        // urlは含めるべきなのだろうか
        return List.of(state.imageItems[itemId].caption)
      case ItemType.CODE_BLOCK:
        const codeBlockItem = state.codeBlockItems[itemId]
        return List.of(codeBlockItem.code, codeBlockItem.language)
      default:
        assertNeverType(itemType)
    }
  }

  /** 指定されたアイテムのテキストトラックに含まれる文字の集合を返す */
  static appearingUnigrams(itemId: ItemId, state: State): Set<string> {
    return Set(this.getTextTracks(itemId, state).join(''))
  }
}
