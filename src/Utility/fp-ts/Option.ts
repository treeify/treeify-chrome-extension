import * as FpOption from 'fp-ts/Option'
import { StackTrace } from 'src/Utility/Debug/StackTrace'
import { Arrow } from 'src/Utility/function'

export * from 'fp-ts/Option'

type Option<A> = FpOption.Option<A>

export const get = <A>(defaultValue: A): Arrow<Option<A>, A> =>
  FpOption.getOrElse(() => defaultValue)

export const getOrThrow = <A>(option: Option<A>): A => {
  const argString = new StackTrace().getStackFrameAt(1).getArgString()
  return FpOption.getOrElse<A>(() => {
    throw new Error(`getOrThrow(${argString})`)
  })(option)
}
