import {State} from 'src/TreeifyWindow/Internal/State'
import {List} from 'immutable'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'

/**
 * 【具体例】
 * "items_0"
 * "nextNewItemId"
 */
export type ChunkId = string

export namespace ChunkId {
  const delimiter = '_'

  export function toPropertyPath(chunkId: ChunkId): List<string> {
    return List(chunkId.split(delimiter))
  }

  export function fromPropertyPath(propertyPath: PropertyPath): ChunkId {
    return propertyPath.join(delimiter)
  }
}

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
  const collectionKeys = new Set(['items', 'textItems', 'webPageItems'])

  /** Stateオブジェクト全体をチャンクリストに変換する */
  export function createAllChunks(state: State): List<Chunk | undefined> {
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
          yield ChunkId.fromPropertyPath(List.of(firstKey, secondKey))
        }
      } else {
        yield firstKey
      }
    }
  }

  /** Stateに変更を加えた全てのPropertyPath集合から、ChunkIdの集合を生成する */
  export function extractChunkIds(propertyPaths: Set<PropertyPath>): Set<ChunkId> {
    const result = new Set<ChunkId>()
    for (const propertyPath of propertyPaths) {
      if (collectionKeys.has(propertyPath.get(0)!.toString())) {
        result.add(ChunkId.fromPropertyPath(propertyPath.take(2)))
      } else {
        result.add(ChunkId.fromPropertyPath(propertyPath.take(1)))
      }
    }
    return result
  }

  // Chunkオブジェクトを生成する…わけだがこれは2階層しか対応していない。
  // TODO: setPropertyみたいに再帰関数でやるべきじゃないかな？
  export function create(state: State, chunkId: ChunkId): Chunk {
    const propertyPath = ChunkId.toPropertyPath(chunkId)
    const firstKey = propertyPath.get(0)
    const secondKey = propertyPath.get(1)
    // @ts-ignore
    const rawObject = secondKey === undefined ? state[firstKey] : state[firstKey][secondKey]
    return {
      id: chunkId,
      data: rawObject,
    }
  }

  /**
   * チャンクリストからStateみたいなオブジェクトを作る。
   * できあがったオブジェクトがStateのスキーマを満たしていることは全く検証・保証しない。
   */
  export function inflateStateFromChunks(chunks: List<Chunk>): object {
    const result = {}
    for (const chunk of chunks) {
      setProperty(result, chunk.id, chunk.data)
    }
    return result
  }

  // a.b.cみたいなネストしたプロパティアクセスでヌルポにならないよう気をつけつつ値を設定する
  function setProperty(targetObject: any, chunkId: ChunkId, value: any) {
    const propertyPath = ChunkId.toPropertyPath(chunkId)
    if (propertyPath.size === 1) {
      targetObject[propertyPath.get(0)!] = value
    } else {
      if (targetObject[propertyPath.get(0)!] === undefined) {
        targetObject[propertyPath.get(0)!] = {}
      }
      setProperty(
        targetObject[propertyPath.get(0)!],
        ChunkId.fromPropertyPath(propertyPath.shift()),
        value
      )
    }
  }
}
