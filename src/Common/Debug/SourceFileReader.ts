/**
 * ローカルのテキストファイルを同期読み込みするためのクラス。
 * セキュリティ上の制限により、ソースファイルくらいしか読み込めるものがない想定で命名。
 * ファイル内容をキャッシュするためにシングルトンクラスにしている。
 */
export class SourceFileReader {
  // シングルトンインスタンス
  private static _instance: SourceFileReader

  // ファイルパスからファイル内容（行の配列）へのMap形式のキャッシュ
  private textFileLinesCache = new Map<string, string[] | undefined>()

  private constructor() {}

  /**
   * シングルトンインスタンスを取得する。
   */
  static get instance(): SourceFileReader {
    if (this._instance === undefined) {
      this._instance = new SourceFileReader()
    }
    return this._instance
  }

  /**
   * 指定されたパスのテキストファイルを読み込む（同期読み込み）。
   * パスをキーとして結果をキャッシュする。
   * 読み込みに失敗した場合はundefinedを返す。
   * @param relativeFilePath 拡張機能のルートディレクトリを基準とするファイルパス。例えば"Logger.js"。
   */
  readLines(relativeFilePath: string): string[] | undefined {
    const cachedValue = this.textFileLinesCache.get(relativeFilePath)
    if (cachedValue !== undefined) {
      return cachedValue
    }

    const lines = this.readLinesWithoutCache(relativeFilePath)
    this.textFileLinesCache.set(relativeFilePath, lines)
    return lines
  }

  /**
   * 指定されたテキストファイルを読み込む（同期読み込み）。
   * 読み込みに失敗した場合はundefinedを返す。
   * @param relativeFilePath 拡張機能のルートディレクトリを基準とするファイルパス。例えば"Logger.js"。
   */
  readLinesWithoutCache(relativeFilePath: string): string[] | undefined {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', chrome.extension.getURL(relativeFilePath), false)
    xhr.send()
    if (xhr.status !== 200) {
      return undefined
    }
    return xhr.responseText.split('\n')
  }
}
