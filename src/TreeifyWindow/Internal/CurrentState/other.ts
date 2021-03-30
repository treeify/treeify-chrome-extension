import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'

/**
 * CurrentStateへの全ての変更を確定し、ModelのStateを書き換える。
 * さらにそれをViewに通知する。
 */
export function commit() {
  Internal.instance.commit()
}

export function setIsFloatingLeftSidebarShown(flag: boolean) {
  Internal.instance.state.isFloatingLeftSidebarShown = flag
  Internal.instance.markAsMutated(PropertyPath.of('isFloatingLeftSidebarShown'))
}
