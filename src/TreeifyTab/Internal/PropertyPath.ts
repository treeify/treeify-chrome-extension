import { State } from 'src/TreeifyTab/Internal/State'
import { RArray } from 'src/Utility/fp-ts'
import { Primitive } from 'type-fest'

/**
 * Stateオブジェクト内の特定の位置を示す値の型。
 * 例えばstate.items[0].childItemIdsというプロパティを指すPropertyPathは、
 * ['items', 0, 'childItemIds']
 * である。
 */
export type PropertyPath = PathOf<State>

export namespace PropertyPath {
  export function of(...args: PropertyPath): PropertyPath {
    return args
  }
}

type PathOf<T, K extends keyof T = keyof T> = T extends Primitive | RArray<unknown>
  ? []
  : K extends K
  ? [K] | [K, ...PathOf<T[K]>]
  : never
