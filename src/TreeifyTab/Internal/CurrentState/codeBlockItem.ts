import {List} from 'immutable'
import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {Instance} from 'src/TreeifyTab/Instance'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {CodeBlockItem, Item} from 'src/TreeifyTab/Internal/State'
import {Timestamp} from 'src/TreeifyTab/Timestamp'

/**
 * 新しい空のコードブロックアイテムを作成し、CurrentStateに登録する。
 * ただしアイテムの配置（親子関係の設定）は行わない。
 */
export function createCodeBlockItem(): ItemId {
  const newItemId = CurrentState.obtainNewItemId()

  const newItem: Item = {
    itemType: ItemType.CODE_BLOCK,
    instance: Instance.getId(),
    iisn: Instance.generateIisn(),
    childItemIds: List.of(),
    parents: {},
    timestamp: Timestamp.now(),
    cssClasses: List.of(),
    cite: null,
  }
  Internal.instance.mutate(newItem, PropertyPath.of('items', newItemId))

  const codeBlockItem: CodeBlockItem = {
    code: '',
    language: '',
  }
  Internal.instance.mutate(codeBlockItem, PropertyPath.of('codeBlockItems', newItemId))

  return newItemId
}

/** StateのcodeBlockItemsオブジェクトから指定されたアイテムIDのエントリーを削除する */
export function deleteCodeBlockItemEntry(itemId: ItemId) {
  Internal.instance.delete(PropertyPath.of('codeBlockItems', itemId))
}

/** コードブロックアイテムのコードを設定する */
export function setCodeBlockItemCode(itemId: ItemId, code: string) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.mutate(code, PropertyPath.of('codeBlockItems', itemId, 'code'))
  })
}

/** コードブロックアイテムの言語を設定する */
export function setCodeBlockItemLanguage(itemId: ItemId, language: string) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.mutate(language, PropertyPath.of('codeBlockItems', itemId, 'language'))
  })
}

export function isEmptyCodeBlockItem(itemId: ItemId): boolean {
  return Internal.instance.state.codeBlockItems[itemId].code.trim() === ''
}
