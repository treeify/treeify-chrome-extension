import {List} from 'immutable'
import {ItemId} from 'src/Common/basicType'
import {DomishObject} from 'src/Common/DomishObject'
import {PropertyPath} from 'src/TreeifyWindow/Model/Batchizer'
import {NextState} from 'src/TreeifyWindow/Model/NextState/index'

/** 指定されたテキストアイテムのdomishObjectsを返す */
export function getTextItemDomishObjects(itemId: ItemId): List<DomishObject> {
  return NextState.getBatchizer().getDerivedValue(
    PropertyPath.of('textItems', itemId, 'domishObjects')
  )
}

/** 指定されたテキストアイテムのdomishObjectsを更新する */
export function setTextItemDomishObjects(textItemId: ItemId, domishObjects: List<DomishObject>) {
  NextState.getBatchizer().postSetMutation(
    PropertyPath.of('textItems', textItemId, 'domishObjects'),
    domishObjects
  )
}
