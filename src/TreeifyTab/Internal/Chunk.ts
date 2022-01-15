import objectPath from 'object-path'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { State } from 'src/TreeifyTab/Internal/State'
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { RArray } from 'src/Utility/fp-ts'

/** StatePathをdelimiterで連結した型 */
export type ChunkId = string

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
  /**
   * 基本的にはどんな記号でもいいはずだが予期せぬ不具合や杞憂を防ぐために次の記号を避けた。
   * ・JavaScriptの識別子として出現しうる'_', '$'
   * ・数値の文字列表現として一般に出現しうる'-', '+', '.', ','
   * ・ファイル名として使えない'/', ':'など
   */
  export const delimiter = '~'

  // Stateのキーのうち、チャンクを分割するもの
  const collectionKeys = new Set([
    'items',
    'textItems',
    'webPageItems',
    'imageItems',
    'codeBlockItems',
    'texItems',
    'pages',
    'reminders',
  ])

  /** Stateオブジェクト全体をチャンクリストに変換する */
  export function createAllChunks(state: State): RArray<Chunk> {
    return [...yieldAllChunkIds(state)].map((chunkId) => {
      return create(state, chunkId)
    })
  }

  // Stateオブジェクトのkeysをenumerateして、チャンクID群を生成する
  export function* yieldAllChunkIds(state: State): Generator<ChunkId> {
    for (const firstKey of Object.keys(state)) {
      if (collectionKeys.has(firstKey)) {
        // @ts-ignore
        for (const secondKey of Object.keys(state[firstKey])) {
          yield [firstKey, secondKey].join(delimiter)
        }
      } else {
        yield firstKey
      }
    }
  }

  /** StatePathからChunkIdに変換する */
  export function convertToChunkId(statePath: StatePath): ChunkId {
    if (collectionKeys.has(statePath[0])) {
      return `${statePath[0]}${delimiter}${statePath[1]}`
    } else {
      return statePath[0]
    }
  }

  // Chunkオブジェクトを生成する…わけだがこれは2階層しか対応していない。
  // TODO: setPropertyみたいに再帰関数でやるべきじゃないかな？
  export function create(state: State, chunkId: ChunkId): Chunk {
    const propertyKeys = chunkId.split(delimiter)
    const firstKey = propertyKeys[0]
    const secondKey = propertyKeys[1]
    // @ts-ignore
    const rawObject = secondKey === undefined ? state[firstKey] : state[firstKey][secondKey]
    return {
      id: chunkId,
      data: State.clone(rawObject),
    }
  }

  /** チャンクリストからStateオブジェクトを作る */
  export function inflateStateFromChunks(chunks: RArray<Chunk>): State {
    const result = Internal.createInitialState()
    for (const chunk of chunks) {
      setProperty(result, chunk.id, chunk.data)
    }
    return result
  }

  function setProperty(targetObject: any, chunkId: ChunkId, value: any) {
    objectPath.set(targetObject, chunkId.split(delimiter), value)
  }
}
