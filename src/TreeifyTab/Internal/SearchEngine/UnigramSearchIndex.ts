import { List } from 'immutable'
import { ItemId } from 'src/TreeifyTab/basicType'

/**
 * 全文検索用のunigram転置インデックス。
 * 大文字・小文字は区別しない形で保存される。
 */
export class UnigramSearchIndex {
  // 文字を出現項目IDに対応付けるMap。
  // 例えばitemIdが5の項目に'あ'という文字が含まれる場合、
  // map.get('あ')が返すSetオブジェクトには5が含まれている。
  private readonly map = new Map<string, Set<ItemId>>()

  /** 与えられた文字が出現する項目IDの集合を返す */
  getItemIds(unigram: string): Set<ItemId> {
    return this.map.get(unigram) ?? new Set<ItemId>()
  }

  addItemId(unigram: string, itemId: ItemId) {
    const normalizedUnigram = UnigramSearchIndex.normalize(unigram)
    const set = this.map.get(normalizedUnigram)
    if (set !== undefined) {
      set.add(itemId)
    } else {
      const newSet = new Set<ItemId>()
      newSet.add(itemId)
      this.map.set(normalizedUnigram, newSet)
    }
  }

  removeItemId(unigram: string, itemId: ItemId) {
    const normalizedUnigram = UnigramSearchIndex.normalize(unigram)
    const set = this.map.get(normalizedUnigram)
    if (set !== undefined) {
      set.delete(itemId)
    }
  }

  /** 与えられた文字列に含まれる全ての文字を含む項目の集合を返す */
  search(text: string): Set<ItemId> {
    const unigrams = List(new Set(UnigramSearchIndex.normalize(text)))
    const sets = unigrams.map((unigram) => this.getItemIds(unigram))
    return UnigramSearchIndex.intersection(sets)
  }

  // 大文字・小文字を区別せず検索するための正規化関数
  static normalize(text: string): string {
    return text.toLowerCase()
  }

  // 積集合を計算する
  private static intersection(sets: List<Set<ItemId>>): Set<ItemId> {
    if (sets.isEmpty()) return new Set<ItemId>()
    if (sets.size === 1) return sets.first()

    // パフォーマンスのためサイズの小さい集合から順に並べる
    const sortedSets = sets.sortBy((set) => set.size)
    const firstSet: Set<ItemId> = sortedSets.first()
    const restSets = sortedSets.shift()
    const result = new Set<ItemId>()
    for (const itemId of firstSet) {
      if (restSets.every((set) => set.has(itemId))) {
        result.add(itemId)
      }
    }
    return result
  }
}
