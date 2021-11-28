import { List, Set } from 'immutable'
import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { UnigramSearchIndex } from 'src/TreeifyTab/Internal/SearchEngine/UnigramSearchIndex'
import { State } from 'src/TreeifyTab/Internal/State'
import { assertNeverType } from 'src/Utility/Debug/assert'

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
  search(searchQuery: string): Set<ItemId> {
    const { positiveSearchWords, negativeSearchWords } = SearchEngine.parseSearchQuery(searchQuery)
    if (positiveSearchWords.isEmpty()) return Set.of()

    // 検索ワードごとに、ヒットする項目の全ItemPathの集合を生成する
    const wordHitItemIdSets = positiveSearchWords.map((andSearchWord) => {
      const normalizedAndSearchWord = UnigramSearchIndex.normalize(andSearchWord)

      return Set(this.unigramSearchIndex.search(andSearchWord)).filter((itemId) => {
        // 除外項目で検索結果をフィルタリングする
        if (CurrentState.shouldBeHidden(itemId)) return false

        const textTracks = SearchEngine.getTextTracks(itemId, Internal.instance.state)
        return textTracks.some((textTrack) => {
          // 大文字・小文字を区別せず検索する
          const normalizedTextTrack = UnigramSearchIndex.normalize(textTrack)
          return normalizedTextTrack.includes(normalizedAndSearchWord)
        })
      })
    })

    const result: ItemId[] = []
    for (let i = 0; i < wordHitItemIdSets.size; i++) {
      const otherWordsHitItemIdSets = wordHitItemIdSets.remove(i)
      for (const wordHitItemId of wordHitItemIdSets.get(i)!) {
        const upperItemIds = Set(CurrentState.yieldAncestorItemIds(wordHitItemId)).add(
          wordHitItemId
        )
        const intersections = otherWordsHitItemIdSets.map((set) => set.intersect(upperItemIds))
        if (intersections.every((set) => !set.isEmpty())) {
          // あるワードヒット項目の先祖集合（自身含む）に他の全てのワードのヒット項目が含まれる場合

          const textTracks = SearchEngine.getTextTracks(wordHitItemId, Internal.instance.state)
          // 全てのテキストトラックにどのNOT検索ワードも含まれない
          const success = textTracks.every((textTrack) => {
            // どのNOT検索ワードもtextTrackに含まれない
            return negativeSearchWords.every((word) => !textTrack.includes(word))
          })
          if (success) {
            result.push(wordHitItemId)
          }
        }
      }
    }
    return Set(result)
  }

  /**
   * 置換ダイアログのための全文検索メソッド。
   * この関数は{@link search}とは次の点が異なる。
   * - AND検索やNOT検索などは行わず、与えられた文字列全体をそのまま検索ワードとして用いる
   * - 大文字・小文字を区別する
   */
  searchToReplace(searchWord: string): Set<ItemId> {
    return Set(this.unigramSearchIndex.search(searchWord)).filter((itemId) => {
      // 除外項目で検索結果をフィルタリングする
      if (CurrentState.shouldBeHidden(itemId)) return false

      // 出典付き項目は置換対象から外す
      if (Internal.instance.state.items[itemId].cite !== null) return false

      const textTracks = SearchEngine.getTextTracks(itemId, Internal.instance.state)
      return textTracks.some((textTrack) => textTrack.includes(searchWord))
    })
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
        return List.of(codeBlockItem.code, codeBlockItem.caption)
      case ItemType.TEX:
        const texItem = state.texItems[itemId]
        return List.of(texItem.code, texItem.caption)
      default:
        assertNeverType(itemType)
    }
  }

  /** 指定された項目のテキストトラックに含まれる文字の集合を返す */
  static appearingUnigrams(itemId: ItemId, state: State): Set<string> {
    return Set(this.getTextTracks(itemId, state).join(''))
  }

  static parseSearchQuery(searchQuery: string): {
    positiveSearchWords: List<string>
    negativeSearchWords: List<string>
  } {
    const searchWords = List(searchQuery.split(/\s/).filter((str) => str !== ''))
    const positiveSearchWords = []
    const negativeSearchWords = []
    for (const searchWord of searchWords) {
      if (searchWord.startsWith('-') && searchWord.length >= 2) {
        negativeSearchWords.push(searchWord.substring(1))
      } else {
        positiveSearchWords.push(searchWord)
      }
    }
    return {
      positiveSearchWords: List(positiveSearchWords),
      negativeSearchWords: List(negativeSearchWords),
    }
  }
}
