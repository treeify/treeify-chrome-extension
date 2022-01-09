import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray'
import * as NERArray$ from 'src/Utility/fp-ts/NERArray'
import * as Option from 'src/Utility/fp-ts/Option'
import * as RArray$ from 'src/Utility/fp-ts/RArray'
import * as RSet from 'src/Utility/fp-ts/RSet'

export type RArray<A> = readonly A[]

export type NERArray<A> = ReadonlyNonEmptyArray<A>

export { Option, RArray$, NERArray$, RSet }
