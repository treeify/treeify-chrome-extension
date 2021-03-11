import {integer} from 'src/Common/basicType'
import {Batchizer, PropertyPath} from 'src/TreeifyWindow/Internal/Batchizer'
import {Command} from 'src/TreeifyWindow/Internal/Command'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {NextState} from 'src/TreeifyWindow/Internal/NextState/index'
import {TextItemSelection} from 'src/TreeifyWindow/Internal/State'

export function getBatchizer(): Batchizer {
  return Internal.nextState
}

/**
 * NextStateへの全ての変更を確定し、ModelのStateを書き換える。
 * さらにそれをViewに通知する。
 */
export function commit() {
  Internal.commit()
}

/** NextStateへの全ての変更を確定し、ModelのStateを書き換える */
export function commitSilently() {
  Internal.commitSilently()
}

/** 指定されたプロパティを削除する */
export function deleteProperty(propertyKeys: PropertyPath) {
  getBatchizer().postSetMutation(propertyKeys, undefined)
}

/** テキストアイテムのキャレット位置（テキスト選択範囲）を返す */
export function getItemTreeTextItemSelection(): TextItemSelection | null {
  return NextState.getBatchizer().getDerivedValue(PropertyPath.of('itemTreeTextItemSelection'))
}

/** テキストアイテムのキャレット位置（テキスト選択範囲）を設定する */
export function setItemTreeTextItemSelection(textItemSelection: TextItemSelection | null) {
  return NextState.getBatchizer().postSetMutation(
    PropertyPath.of('itemTreeTextItemSelection'),
    textItemSelection
  )
}

/** テキストアイテムのキャレット位置を設定する */
export function setItemTreeTextItemCaretDistance(distance: integer) {
  setItemTreeTextItemSelection({focusDistance: distance, anchorDistance: distance})
}

/** アイテムツリーのInputBindingからコマンドを取得する */
export function getItemTreeCommand(inputId: InputId): Command | undefined {
  const propertyPath = PropertyPath.of('itemTreeInputBinding', inputId)
  return NextState.getBatchizer().getDerivedValue(propertyPath)
}
