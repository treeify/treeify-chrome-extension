/**
 * 予期せぬ例外を補足し、何か有益なことをするための汎用関数。
 * 現在はアラートでエラーを通知するようにしている。
 * これはドッグフーディング中にエラーに気づかず使い続けてしまう問題への対策である。
 * リリース時はアラートを出さないようにするかもしれない（何をするのがいいか検討中）。
 */
export function doWithErrorCapture<T>(f: () => T): T {
  try {
    return f()
  } catch (e) {
    alert(e)
    throw e
  }
}

/** {@link doWithErrorCapture}のasync版 */
export async function doAsyncWithErrorCapture<T>(f: () => Promise<T>): Promise<T> {
  try {
    return await f()
  } catch (e) {
    alert(e)
    throw e
  }
}
