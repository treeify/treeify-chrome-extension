import {SourceFileReader} from 'src/Common/Debug/SourceFileReader'
import {integer} from 'src/Common/integer'

/**
 * スタックトレースの情報を取得するためのクラス。
 */
export class StackTrace {
  private readonly stackTraceLines: string[]

  /**
   * 呼び出し時点のスタックトレースを内部に保持する。
   */
  constructor() {
    /*
    ↓Chromeのnew Error().stackの例
    Error
        at new StackTrace (chrome-extension://fagchoclpalcopjmohpackkfnbjiojgp/Debug/StackTrace.js:4:25)
        at dump (chrome-extension://fagchoclpalcopjmohpackkfnbjiojgp/Debug/Console.js:22:24)
        at g (chrome-extension://fagchoclpalcopjmohpackkfnbjiojgp/Debug/Console.js:45:5)
        at chrome-extension://fagchoclpalcopjmohpackkfnbjiojgp/Debug/Console.js:49:1
     */
    const stack = new Error().stack
    if (stack === undefined) throw Error('new Error().stackがundefined。')
    this.stackTraceLines = stack.split(/\r?\n/)
  }

  /**
   * このスタックトレースの関数呼び出し元を辿ってスタックフレームを返す。
   * indexが0の場合、このクラスのコンストラクタ自身の呼び出しスタックフレームを返す。
   * indexが1の場合、このクラスのコンストラクタを呼び出したメソッドの呼び出しスタックフレームを返す。
   */
  getStackFrameAt(index: integer): StackFrame {
    const regExp = /\s*at\s(.*?)\(?chrome-extension:\/\/\w+\/(.+):(\d+):(\d+)/

    const linedText = this.stackTraceLines[index + 2]
    const matchResult: any = linedText.match(regExp)
    let callerName: string = matchResult[1]
    const filePath: string = matchResult[2]
    const lineNumber: integer = parseInt(matchResult[3], 10)
    const columnNumber: integer = parseInt(matchResult[4], 10)

    if (callerName === '') {
      if (this.stackTraceLines.length - 1 === index + 2) {
        callerName = '(top level)'
      } else {
        // TODO: 無名関数の場合、コールバックの情報がほしい
      }
    }

    return new StackFrame(callerName, filePath, lineNumber, columnNumber)
  }
}

/**
 * スタックトレース内のそれぞれの関数呼び出しを表すデータクラス。
 */
export class StackFrame {
  constructor(
    readonly callerName: string,
    readonly filePath: string,
    readonly lineNumber: integer,
    readonly columnNumber: integer
  ) {}

  /**
   * 対応する関数呼び出しの引数部分を文字列で返す。
   * 本来ならソースマップを解析するべきなのだが、Treeifyの環境で簡単に使えるライブラリが見つからなかった。
   * そのため簡易的な実装になっている。
   */
  getArgString(): string {
    const sourceFileLines = SourceFileReader.instance.readLines(this.filePath)!
    const callingLine = sourceFileLines[this.lineNumber - 1]

    const exec = /.+\(.+WEBPACK_IMPORTED_MODULE.+\[".+"]\)\((.+)\)/.exec(callingLine)
    if (exec !== null) {
      return exec[1]
    }

    const indexOfArgument = callingLine.indexOf('(') + 1
    const lastIndexOfArgument = callingLine.lastIndexOf(')')
    return callingLine.substring(indexOfArgument, lastIndexOfArgument)
  }
}
