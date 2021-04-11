/**
 * 予期せぬ例外が出た際に何か有益な処理を行うための関数。
 * 現在はアラートでエラーを通知するようにしている。
 * これはドッグフーディング中にエラーに気づかず使い続けてしまう問題への対策である。
 * リリース時はアラートを出さないようにするかもしれない（何をするのがいいか検討中）。
 */
export function doWithErrorHandling<T>(f: () => T): T {
  try {
    return f()
  } catch (e) {
    alert(e)
    throw e
  }
}

/** {@link doWithErrorHandling}のasync版 */
export async function doAsyncWithErrorHandling<T>(f: () => Promise<T>): Promise<T> {
  try {
    return await f()
  } catch (e) {
    alert(e)
    throw e
  }
}
