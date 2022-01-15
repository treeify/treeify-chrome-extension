import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { GlobalItemId } from 'src/TreeifyTab/Instance'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { CodeBlockItem, Item } from 'src/TreeifyTab/Internal/State'
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { Timestamp } from 'src/Utility/Timestamp'

/** 新しい空のコードブロック項目を作成する。ただし項目の配置（親子関係の設定）は行わない */
export function createCodeBlockItem(): ItemId {
  const newItemId = CurrentState.obtainNewItemId()

  const newItem: Item = {
    type: ItemType.CODE_BLOCK,
    globalItemId: GlobalItemId.generate(),
    childItemIds: [],
    parents: {},
    timestamp: Timestamp.now(),
    cssClasses: [],
    source: null,
  }
  Internal.instance.mutate(newItem, StatePath.of('items', newItemId))

  const codeBlockItem: CodeBlockItem = {
    code: '',
    language: '',
    caption: '',
  }
  Internal.instance.mutate(codeBlockItem, StatePath.of('codeBlockItems', newItemId))

  return newItemId
}

/** StateのcodeBlockItemsオブジェクトから指定された項目IDのエントリーを削除する */
export function deleteCodeBlockItemEntry(itemId: ItemId) {
  Internal.instance.delete(StatePath.of('codeBlockItems', itemId))
}

/** コードブロック項目のコードを設定する */
export function setCodeBlockItemCode(itemId: ItemId, code: string) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.mutate(code, StatePath.of('codeBlockItems', itemId, 'code'))
  })
}

/** コードブロック項目の言語を設定する */
export function setCodeBlockItemLanguage(itemId: ItemId, language: string) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.mutate(language, StatePath.of('codeBlockItems', itemId, 'language'))
  })
}

export function setCodeBlockItemCaption(itemId: ItemId, caption: string) {
  Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
    Internal.instance.mutate(caption, StatePath.of('codeBlockItems', itemId, 'caption'))
  })
}

export function isEmptyCodeBlockItem(itemId: ItemId): boolean {
  return Internal.instance.state.codeBlockItems[itemId].code.trim() === ''
}
