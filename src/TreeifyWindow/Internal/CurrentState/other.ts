import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {integer} from 'src/Common/basicType'

/**
 * CurrentStateへの全ての変更を確定し、ModelのStateを書き換える。
 * さらにそれをViewに通知する。
 */
export function commit() {
  Internal.instance.commit()
}

export function setTreeifyWindowWidth(width: integer) {
  Internal.instance.state.treeifyWindowWidth = width
  Internal.instance.mutatedPropertyPaths.add(PropertyPath.of('treeifyWindowWidth'))
}

export function setIsFloatingLeftSidebarShown(flag: boolean) {
  Internal.instance.state.isFloatingLeftSidebarShown = flag
  Internal.instance.mutatedPropertyPaths.add(PropertyPath.of('isFloatingLeftSidebarShown'))
}
