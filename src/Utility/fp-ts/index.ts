import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray'
import { ReadonlyRecord } from 'fp-ts/ReadonlyRecord'
import * as NERArray$ from 'src/Utility/fp-ts/NERArray'
import * as Option$ from 'src/Utility/fp-ts/Option'
import * as RArray$ from 'src/Utility/fp-ts/RArray'
import * as RRecord$ from 'src/Utility/fp-ts/RRecord'
import * as RSet$ from 'src/Utility/fp-ts/RSet'

export type RArray<A> = readonly A[]

export type NERArray<A> = ReadonlyNonEmptyArray<A>

export type RSet<A> = ReadonlySet<A>

export type RRecord<K extends string, V> = ReadonlyRecord<K, V>

export { Option$, RArray$, NERArray$, RSet$, RRecord$ }
