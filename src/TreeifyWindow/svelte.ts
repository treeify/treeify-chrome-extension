import {get as svelteGet, readable, Readable, Unsubscriber} from 'svelte/store'

/**
 * Svelte標準のget関数をちょっと柔軟にしたユーティリティ関数。
 * nullやundefinedをいい感じにスルーしてくれる。
 */
export function get<T>(readable: Readable<T>): T
export function get<T>(readable: Readable<T> | undefined | null): T | undefined
export function get<T>(readable: Readable<T> | undefined | null) {
  if (readable === undefined || readable === null) return undefined

  return svelteGet(readable)
}

/**
 * 依存先が動的に変化する複雑・動的なderived相当のReadableを作る関数。
 * モナド(Monad)におけるjoinっぽい関数だと思ったのでそう命名した（実際にモナドやjoinの条件を満たすのかは知らない）。
 */
export function join<T>(dynamicReadable: Readable<Readable<T>>): Readable<T> {
  // 現在参照している動的Readableの購読を解除する関数
  let unsubscriber: Unsubscriber | undefined

  const initialValue = get(get(dynamicReadable))

  return readable(initialValue, (set) => {
    return dynamicReadable.subscribe((level1) => {
      // 参照していたReadableのサブスクライバーを登録解除する（怠るとメモリリーク）
      unsubscriber?.()

      unsubscriber = level1.subscribe((level2) => {
        set(level2)
      })
    })
  })
}
