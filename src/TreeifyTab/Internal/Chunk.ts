import {List} from 'immutable'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {State} from 'src/TreeifyTab/Internal/State'

/**
 * データ型の実体としてはPropertyPathと同じだが、
 * チャンクとして扱われるデータ単位のIDとして使われるPropertyPathを指すエイリアス型。
 */
export type ChunkId = PropertyPath

/**
 * Stateの断片を表すデータ型。
 * シリアライズのために用いられる。
 * シリアライズしたいだけならStateをまるごとJSON化すれば十分なのだが、
 * データ量が大きく、差分書き込みに適さない形式なのでチャンクという単位に区切って扱う。
 */
export type Chunk = {
  id: ChunkId
  /**
   * ペイロードデータ。
   * undefinedの場合、このチャンクがエントリーごと削除されている（あるいは削除すべき）ことを意味する。
   */
  data: any
}

/** チャンク関連のコードをまとめる名前空間 */
export namespace Chunk {
  // Stateのキーのうち、チャンクを分割するもの
  const collectionKeys = new Set([
    'items',
    'textItems',
    'webPageItems',
    'imageItems',
    'codeBlockItems',
    'texItems',
  ])

  /** Stateオブジェクト全体をチャンクリストに変換する */
  export function createAllChunks(state: State): List<Chunk> {
    return List(yieldAllChunkIds(state)).map((chunkId) => {
      return create(state, chunkId)
    })
  }

  // Stateオブジェクトのkeysをenumerateして、チャンクID群を生成する
  export function* yieldAllChunkIds(state: State): Generator<ChunkId> {
    for (const firstKey of Object.keys(state)) {
      if (collectionKeys.has(firstKey)) {
        // @ts-ignore
        for (const secondKey of Object.keys(state[firstKey])) {
          yield PropertyPath.of(firstKey, secondKey)
        }
      } else {
        yield firstKey
      }
    }
  }

  /** PropertyPathからChunkIdに変換する */
  export function convertToChunkId(propertyPath: PropertyPath): ChunkId {
    const propertyKeys = PropertyPath.splitToPropertyKeys(propertyPath)
    if (collectionKeys.has(propertyKeys.get(0)!.toString())) {
      return PropertyPath.of(...propertyKeys.take(2))
    } else {
      return PropertyPath.of(...propertyKeys.take(1))
    }
  }

  // Chunkオブジェクトを生成する…わけだがこれは2階層しか対応していない。
  // TODO: setPropertyみたいに再帰関数でやるべきじゃないかな？
  export function create(state: State, chunkId: ChunkId): Chunk {
    const propertyKeys = PropertyPath.splitToPropertyKeys(chunkId)
    const firstKey = propertyKeys.get(0)
    const secondKey = propertyKeys.get(1)
    // @ts-ignore
    const rawObject = secondKey === undefined ? state[firstKey] : state[firstKey][secondKey]
    return {
      id: chunkId,
      data: State.clone(rawObject),
    }
  }

  /** チャンクリストからStateオブジェクトを作る */
  export function inflateStateFromChunks(chunks: List<Chunk>): State {
    const result = Internal.createInitialState()
    for (const chunk of chunks) {
      setProperty(result, chunk.id, chunk.data)
    }
    return result
  }

  // a.b.cのようなネストしたプロパティアクセスでヌルポにならないよう気をつけつつ値を設定する
  function setProperty(targetObject: any, chunkId: ChunkId, value: any) {
    const propertyKeys = PropertyPath.splitToPropertyKeys(chunkId)
    if (propertyKeys.size === 1) {
      targetObject[propertyKeys.get(0)!] = value
    } else {
      if (targetObject[propertyKeys.get(0)!] === undefined) {
        targetObject[propertyKeys.get(0)!] = {}
      }
      setProperty(
        targetObject[propertyKeys.get(0)!],
        PropertyPath.of(...propertyKeys.shift()),
        value
      )
    }
  }
}
