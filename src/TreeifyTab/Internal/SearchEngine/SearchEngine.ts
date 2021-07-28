import {List, Set} from 'immutable'
import {assert, assertNeverType} from 'src/Common/Debug/assert'
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
    // 各項目に含まれるテキストを抽出・unigram化し、検索インデックスに登録する
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
    const {andSearchWords, notSearchWords} = SearchEngine.parseSearchQuery(searchQuery)
    if (andSearchWords.isEmpty()) return List.of()

    const normalizedNotSearchWords = notSearchWords.map(UnigramSearchIndex.normalize)

    // 検索ワードごとに、ヒットする項目の全ItemPathの集合を生成する
    const hitItemIdSets = andSearchWords.map((andSearchWord) => {
      const normalizedAndSearchWord = UnigramSearchIndex.normalize(andSearchWord)

      return Set(this.unigramSearchIndex.search(andSearchWord)).filter((itemId) => {
        // 除外項目で検索結果をフィルタリングする
        if (CurrentState.shouldBeHidden(itemId)) return false

        const textTracks = SearchEngine.getTextTracks(itemId, Internal.instance.state)
        return textTracks.some((textTrack) => {
          // 大文字・小文字を区別せず検索する
          const normalizedTextTrack = UnigramSearchIndex.normalize(textTrack)
          return (
            normalizedTextTrack.includes(normalizedAndSearchWord) &&
            normalizedNotSearchWords.every((word) => !normalizedTextTrack.includes(word))
          )
        })
      })
    })

    const combination = List(SearchEngine.combination(hitItemIdSets))
    // ItemIdの組み合わせのうち、包含関係にあるものだけをピックアップする
    const filtered = combination.filter(SearchEngine.isInclusive)
    // 生き残った組み合わせに含まれる全ItemIdを返す
    return Set(filtered.flatMap((list) => list)).toList()
  }

  /**
   * 指定された項目のテキストトラックの変化に合わせて検索インデックスを更新する。
   * 項目内のテキストを更新する処理は全て第2引数の関数内で行うべし。
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

  /**
   * 指定された項目に関するデータを検索インデックスから削除する。
   * 項目を削除する直前に呼び出す想定。
   */
  deleteSearchIndex(itemId: ItemId) {
    for (const unigram of SearchEngine.appearingUnigrams(itemId, Internal.instance.state)) {
      this.unigramSearchIndex.removeItemId(unigram, itemId)
    }
  }

  /** 指定された項目が持っている検索可能テキストデータ（Treeifyではテキストトラックと呼ぶ）のリストを返す */
  static getTextTracks(itemId: ItemId, state: State): List<string> {
    const itemType = state.items[itemId].type
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

  /** 指定された項目のテキストトラックに含まれる文字の集合を返す */
  static appearingUnigrams(itemId: ItemId, state: State): Set<string> {
    return Set(this.getTextTracks(itemId, state).join(''))
  }

  // 要するに[{1, 2}, {3, 4}]を[1, 3], [1, 4], [2, 3], [2, 4]に変換する
  static *combination<T>(sets: List<Set<T>>): Generator<List<T>> {
    assert(sets.size > 0)

    if (sets.size === 1) {
      const first: Set<T> = sets.first()
      for (const element of first) {
        yield List.of(element)
      }
    } else {
      const last: Set<T> = sets.last()
      for (const sublist of this.combination(sets.pop())) {
        for (const element of last) {
          yield sublist.push(element)
        }
      }
    }
  }

  // 全項目が先祖-子孫関係にある場合にtrueを返す
  static isInclusive(itemIds: List<ItemId>): boolean {
    const list = itemIds.map((itemId) => {
      return Set(CurrentState.yieldAncestorItemIds(itemId)).add(itemId)
    })

    const sorted = list.sortBy((itemPath) => itemPath.size)
    for (let i = 0; i < sorted.size - 1; i++) {
      const lhs = sorted.get(i)!
      const rhs = sorted.get(i + 1)!
      if (!lhs.isSubset(rhs)) {
        return false
      }
    }
    return true
  }

  // 検索クエリをAND検索ワードとNOT検索ワードに分解する
  static parseSearchQuery(searchQuery: string): {
    andSearchWords: List<string>
    notSearchWords: List<string>
  } {
    const searchWords = List(searchQuery.split(/\s/).filter((str) => str !== ''))
    const andSearchWords = []
    const notSearchWords = []
    for (const searchWord of searchWords) {
      if (searchWord.startsWith('-') && searchWord.length >= 2) {
        notSearchWords.push(searchWord.substring(1))
      } else {
        andSearchWords.push(searchWord)
      }
    }
    return {
      andSearchWords: List(andSearchWords),
      notSearchWords: List(notSearchWords),
    }
  }
}
