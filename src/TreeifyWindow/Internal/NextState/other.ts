import {Batchizer, PropertyPath} from 'src/TreeifyWindow/Internal/Batchizer'
import {Command} from 'src/TreeifyWindow/Internal/Command'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {NextState} from 'src/TreeifyWindow/Internal/NextState/index'
import {integer} from 'src/Common/basicType'

export function getBatchizer(): Batchizer {
  return Internal.instance.nextState
}

/**
 * NextStateへの全ての変更を確定し、ModelのStateを書き換える。
 * さらにそれをViewに通知する。
 */
export function commit() {
  Internal.instance.commit()
}

/** 指定されたプロパティを削除する */
export function deleteProperty(propertyKeys: PropertyPath) {
  getBatchizer().postSetMutation(propertyKeys, undefined)
}

/** アイテムツリーのInputBindingからコマンドを取得する */
export function getItemTreeCommand(inputId: InputId): Command | undefined {
  const propertyPath = PropertyPath.of('itemTreeInputBinding', inputId)
  return NextState.getBatchizer().getDerivedValue(propertyPath)
}

export function setTreeifyWindowWidth(width: integer) {
  NextState.getBatchizer().postSetMutation(PropertyPath.of('treeifyWindowWidth'), width)
}
