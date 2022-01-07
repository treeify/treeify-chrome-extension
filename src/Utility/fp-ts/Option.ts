import * as Option from 'fp-ts/Option'
import { StackTrace } from 'src/Utility/Debug/StackTrace'
import { Arrow } from 'src/Utility/function'

export * from 'fp-ts/Option'

/** Option.Option<A>の代わりにOption.T<A>と書けるようにする */
export type T<A> = Option.Option<A>

export const get = <A>(defaultValue: A): Arrow<T<A>, A> => Option.getOrElse(() => defaultValue)

export const getOrThrow = <A>(option: T<A>): A => {
  const argString = new StackTrace().getStackFrameAt(1).getArgString()
  return Option.getOrElse<A>(() => {
    throw new Error(`getOrThrow(${argString})`)
  })(option)
}
