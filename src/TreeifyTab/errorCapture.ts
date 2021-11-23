import { External } from 'src/TreeifyTab/External/External'
import { Internal } from 'src/TreeifyTab/Internal/Internal'

/**
 * @deprecated
 */
export function doWithErrorCapture<T>(f: () => T): T {
  return f()
}

/**
 * {@link doWithErrorCapture}のasync版
 * @deprecated
 */
export async function doAsyncWithErrorCapture<T>(f: () => Promise<T>): Promise<T> {
  return await f()
}

function dumpCurrentMemory() {
  Internal.instance.dumpCurrentState()
  External.instance.dumpCurrentState()
}
