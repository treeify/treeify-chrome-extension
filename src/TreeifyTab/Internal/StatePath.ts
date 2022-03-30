import { State } from 'src/TreeifyTab/Internal/State'
import { RArray } from 'src/Utility/fp-ts'
import { Primitive } from 'type-fest'

/**
 * Stateオブジェクト内の特定の位置を示す値の型。
 * 例えばstate.items[0].childItemIdsというプロパティを指すStatePathは、
 * ['items', 0, 'childItemIds']
 * である。
 */
export type StatePath = PathOf<State>

export namespace StatePath {
  export function of<T extends StatePath>(...args: T): T {
    return args
  }
}

/** 指定されたネストしたオブジェクト型のプロパティを表す型 */
type PathOf<T, K extends keyof T = keyof T> = T extends Primitive | RArray<unknown>
  ? readonly []
  : K extends K
  ? readonly [K] | readonly [K, ...PathOf<T[K]>]
  : never

/** {@link PathOf}で表されたプロパティの値の型 */
export type PathValue<Path, S = State> = Path extends readonly [infer First, ...infer Rest]
  ? // @ts-ignore
    PathValue<Rest, S[First]>
  : S
