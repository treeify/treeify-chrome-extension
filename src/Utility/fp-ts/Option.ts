import * as Option from 'fp-ts/Option'

export * from 'fp-ts/Option'

/** Option.Option<A>の代わりにOption.T<A>と書けるようにする */
export type T<A> = Option.Option<A>

export const get = <T>(defaultValue: T) => Option.getOrElse(() => defaultValue)
