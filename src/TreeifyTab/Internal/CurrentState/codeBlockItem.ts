import { List } from 'immutable'
import { Timestamp } from 'src/Common/Timestamp'
import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { GlobalItemId } from 'src/TreeifyTab/Instance'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { CodeBlockItem, Item } from 'src/TreeifyTab/Internal/State'

/**
 * 新しい空のコードブロック項目を作成し、CurrentStateに登録する。
 * ただし項目の配置（親子関係の設定）は行わない。
 */
export function createCodeBlockItem(): ItemId {
  const newItemId = CurrentState.obtainNewItemId()

  const newItem: Item = {
    type: ItemType.CODE_BLOCK,
    globalItemId: GlobalItemId.generate(),
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
    caption: '',
  }
  Internal.instance.mutate(codeBlockItem, PropertyPath.of('codeBlockItems', newItemId))

  return newItemId
}

/** StateのcodeBlockItemsオブジェクトから指定された項目IDのエントリーを削除する */
export function deleteCodeBlockItemEntry(itemId: ItemId) {
  Internal.instance.delete(PropertyPath.of('codeBlockItems', itemId))
}

/** コードブロック項目のコードを設定する */
export function setCodeBlockItemCode(itemId: ItemId, code: string) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.mutate(code, PropertyPath.of('codeBlockItems', itemId, 'code'))
  })
}

/** コードブロック項目の言語を設定する */
export function setCodeBlockItemLanguage(itemId: ItemId, language: string) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.mutate(language, PropertyPath.of('codeBlockItems', itemId, 'language'))
  })
}

export function setCodeBlockItemCaption(itemId: ItemId, caption: string) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.mutate(caption, PropertyPath.of('codeBlockItems', itemId, 'caption'))
  })
}

export function isEmptyCodeBlockItem(itemId: ItemId): boolean {
  return Internal.instance.state.codeBlockItems[itemId].code.trim() === ''
}
