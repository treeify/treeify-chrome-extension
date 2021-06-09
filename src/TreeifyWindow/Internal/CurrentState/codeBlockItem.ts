import {List} from 'immutable'
import {ItemId, ItemType} from 'src/TreeifyWindow/basicType'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {CodeBlockItem, Item} from 'src/TreeifyWindow/Internal/State'
import {Timestamp} from 'src/TreeifyWindow/Timestamp'
import {writable} from 'svelte/store'

/**
 * 新しい空のコードブロックアイテムを作成し、CurrentStateに登録する。
 * ただしアイテムの配置（親子関係の設定）は行わない。
 */
export function createCodeBlockItem(): ItemId {
  const newItemId = CurrentState.obtainNewItemId()

  const newItem: Item = {
    itemType: ItemType.CODE_BLOCK,
    childItemIds: List.of(),
    parents: {},
    timestamp: writable(Timestamp.now()),
    cssClasses: writable(List.of()),
  }
  Internal.instance.state.items[newItemId] = newItem
  Internal.instance.markAsMutated(PropertyPath.of('items', newItemId))

  const codeBlockItem: CodeBlockItem = {
    code: writable(''),
    language: writable(''),
  }
  Internal.instance.state.codeBlockItems[newItemId] = codeBlockItem
  Internal.instance.markAsMutated(PropertyPath.of('codeBlockItems', newItemId))

  return newItemId
}

/** StateのcodeBlockItemsオブジェクトから指定されたアイテムIDのエントリーを削除する */
export function deleteCodeBlockItemEntry(itemId: ItemId) {
  delete Internal.instance.state.codeBlockItems[itemId]
  Internal.instance.markAsMutated(PropertyPath.of('codeBlockItems', itemId))
}

/** コードブロックアイテムのコードを設定する */
export function setCodeBlockItemCode(itemId: ItemId, code: string) {
  Internal.instance.state.codeBlockItems[itemId].code.set(code)
  Internal.instance.markAsMutated(PropertyPath.of('codeBlockItems', itemId, 'code'))
}

/** コードブロックアイテムの言語を設定する */
export function setCodeBlockItemLanguage(itemId: ItemId, language: string) {
  Internal.instance.state.codeBlockItems[itemId].language.set(language)
  Internal.instance.markAsMutated(PropertyPath.of('codeBlockItems', itemId, 'language'))
}
