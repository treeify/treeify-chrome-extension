import {Internal} from 'src/TreeifyWindow/Internal/Internal'

/**
 * CurrentStateへの全ての変更を確定し、ModelのStateを書き換える。
 * さらにそれをViewに通知する。
 */
export function commit() {
  Internal.instance.commit()
}
