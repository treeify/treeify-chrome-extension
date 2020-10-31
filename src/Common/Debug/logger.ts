import {StackFrame, StackTrace} from 'src/Common/Debug/StackTrace'

/**
 * console.logに色々な機能を追加したユーティリティ関数。
 * 呼び出し元に関する情報を収集し、それらも合わせて表示する。
 */
export function dump(...args: any[]) {
  const stackFrame = new StackTrace().getStackFrameAt(1)
  console.groupCollapsed(stackFrame.getArgString(), '=', ...args.map(formatForConsole))
  console.log(createCallerInfoString(stackFrame))
  console.groupEnd()
}

/**
 * console.logに色々な機能を追加したユーティリティ関数。
 * 呼び出し元に関する情報を収集し、それらも合わせて表示する。
 */
export function log(...args: any[]) {
  const stackFrame = new StackTrace().getStackFrameAt(1)
  console.groupCollapsed(...args.map(formatForConsole))
  console.log(createCallerInfoString(stackFrame))
  console.groupEnd()
}

// DOM要素などJSON.stringifyに適さないオブジェクトを考慮したフォーマット関数
function formatForConsole(value: any): any {
  // 一部の型へのアドホックな対策
  if (value instanceof Event) return value
  if (value instanceof Node) return value

  // JSON.stringifyは循環参照を持つ場合に例外を投げるのでその対策
  try {
    return toString(value)
  } catch {
    return value
  }
}

function createCallerInfoString(stackFrame: StackFrame): string {
  const filePath = stackFrame.getSourceMappedFilePath()
  return `in ${stackFrame.callerName} @ ${filePath}:`
}

/**
 * 与えれらた値を表示用の文字列化する。
 * 一定以上の文字数だった場合は自動的に改行とインデントを行う。
 * ただしJSON.stringifyを使う都合上、undefinedはnullとして扱われる。
 * この関数はJSON.stringifyが投げた例外をハンドリングしない。
 */
export function toString(value: any): string {
  const nonIndent = JSON.stringify(value, replacer)
  if (nonIndent.length < 80) {
    return nonIndent
  }
  return JSON.stringify(value, replacer, '  ')
}

function replacer(this: any, key: string, value: any): any {
  if (value === undefined) {
    return null
  }
  return value
}
