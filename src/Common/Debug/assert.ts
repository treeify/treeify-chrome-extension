import {StackTrace} from 'src/Common/Debug/StackTrace'

/**
 * 与えられた論理式がtrueになることを表明する。
 * もしfalseの場合は例外を投げる。
 */
export function assert(value: boolean, message?: string) {
  if (!value) {
    if (message !== undefined) {
      throw new Error(message)
    } else {
      const argString = new StackTrace().getStackFrameAt(1).getArgString()
      throw new Error(`アサーションエラー: assert(${argString})`)
    }
  }
}

/**
 * nullではないことを表明する。
 * もしnullの場合は例外を投げる。
 */
export function assertNonNull<T>(value: T | null, message?: string): asserts value is T {
  if (value === null) {
    if (message !== undefined) {
      throw new Error(message)
    } else {
      const argString = new StackTrace().getStackFrameAt(1).getArgString()
      throw new Error(`アサーションエラー: assertNonNull(${argString})`)
    }
  }
}

/**
 * undefinedではないことを表明する。
 * もしundefinedの場合は例外を投げる。
 */
export function assertNonUndefined<T>(value: T | undefined, message?: string): asserts value is T {
  if (value === undefined) {
    if (message !== undefined) {
      throw new Error(message)
    } else {
      const argString = new StackTrace().getStackFrameAt(1).getArgString()
      throw new Error(`アサーションエラー: assertNonUndefined(${argString})`)
    }
  }
}

/**
 * 与えられた式がnever型であることを表明する。
 * 他のassert系関数と異なり、静的に検査される。
 * 実行されると引数の値によらず例外を投げる。
 */
export function assertNeverType(value: never, message?: string): never {
  if (message !== undefined) {
    throw new Error(message)
  } else {
    const argString = new StackTrace().getStackFrameAt(1).getArgString()
    throw new Error(`アサーションエラー: assertNeverType(${argString})`)
  }
}
