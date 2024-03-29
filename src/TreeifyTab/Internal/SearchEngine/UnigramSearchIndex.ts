import { pipe } from 'fp-ts/function'
import { DefaultMap } from 'mnemonist'
import { ItemId } from 'src/TreeifyTab/basicType'
import { RArray, RArray$, RSet, RSet$ } from 'src/Utility/fp-ts'

/**
 * 全文検索用のunigram転置インデックス。
 * 大文字・小文字は区別しない形で保存される。
 */
export class UnigramSearchIndex {
  // 文字を出現項目IDに対応付けるMap。
  // 例えばitemIdが5の項目に'あ'という文字が含まれる場合、
  // map.get('あ')が返すSetオブジェクトには5が含まれている。
  private readonly map = new DefaultMap<string, Set<ItemId>>(() => new Set())

  /** 与えられた文字が出現する項目IDの集合を返す */
  getItemIds(unigram: string): RSet<ItemId> {
    return this.map.get(unigram)
  }

  addItemId(unigram: string, itemId: ItemId) {
    const normalizedUnigram = UnigramSearchIndex.normalize(unigram)
    this.map.get(normalizedUnigram).add(itemId)
  }

  removeItemId(unigram: string, itemId: ItemId) {
    const normalizedUnigram = UnigramSearchIndex.normalize(unigram)
    this.map.get(normalizedUnigram).delete(itemId)
  }

  /** 与えられた文字列に含まれる全ての文字を含む項目の集合を返す */
  search(text: string): RSet<ItemId> {
    return pipe(
      RSet$.from(UnigramSearchIndex.normalize(text)),
      RSet$.map((unigram: string) => this.getItemIds(unigram)),
      RArray$.from,
      UnigramSearchIndex.intersection
    )
  }

  // 大文字・小文字を区別せず検索するための正規化関数
  static normalize(text: string): string {
    return text.toLowerCase()
  }

  // 積集合を計算する
  private static intersection(sets: RArray<RSet<ItemId>>): RSet<ItemId> {
    if (sets.length === 0) return new Set<ItemId>()
    if (sets.length === 1) return sets[0]

    // パフォーマンスのためサイズの小さい集合から順に並べる
    const sortedSets = RArray$.sortByNumber((set: RSet<ItemId>) => set.size)(sets)
    const restSets = RArray$.shift(sortedSets)
    const result = new Set<ItemId>()
    for (const itemId of sortedSets[0]) {
      if (restSets.every((set) => set.has(itemId))) {
        result.add(itemId)
      }
    }
    return result
  }
}
