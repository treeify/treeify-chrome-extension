import { ItemId, ItemType, TOP_ITEM_ID } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { Command } from 'src/TreeifyTab/Internal/Command'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { RArray } from 'src/Utility/fp-ts'

export type ContextMenuItemProps = {
  title: string
  onClick(): void
}

export function createContextMenuItemPropsGroups(): RArray<RArray<ContextMenuItemProps>> {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const selectedItemIds = selectedItemPaths.map(ItemPath.getItemId)
  const subtreeItemIds = selectedItemIds.flatMap((itemId) => [
    ...CurrentState.yieldSubtreeItemIdsShallowly(itemId),
  ])
  const isSingleSelect = selectedItemPaths.length === 1
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const item = Internal.instance.state.items[targetItemId]
  const hasParent = ItemPath.hasParent(targetItemPath)
  const includeTranscludedItem = selectedItemIds.some(
    (itemId) => CurrentState.countParents(itemId) >= 2
  )

  const group1: ContextMenuItemProps[] = []
  const group2: ContextMenuItemProps[] = []
  const group3: ContextMenuItemProps[] = []
  const group4: ContextMenuItemProps[] = []

  if (hasParent) {
    if (isSingleSelect && item.childItemIds.length > 0) {
      group1.push({
        title: 'ツリーを削除',
        onClick: () => Command.removeItem(),
      })
      group1.push({
        title: '単体を削除',
        onClick: () => Command.deleteJustOneItem(),
      })
    } else {
      group1.push({
        title: '削除',
        onClick: () => Command.removeItem(),
      })
    }
  }

  if (hasParent && includeTranscludedItem) {
    group1.push({
      title: '削除（他のトランスクルードもまとめて削除）',
      onClick: () => Command.deleteItem(),
    })
  }

  const hasTab = (itemId: ItemId) =>
    External.instance.tabItemCorrespondence.getTabId(itemId) !== undefined
  if (subtreeItemIds.some(hasTab)) {
    group2.push({
      title: 'ツリーに紐づくタブを閉じる',
      onClick: () => Command.closeTreeTabs(),
    })
  }

  const isTabClosed = (itemId: ItemId) =>
    Internal.instance.state.items[itemId].type === ItemType.WEB_PAGE &&
    External.instance.tabItemCorrespondence.getTabId(itemId) === undefined
  if (subtreeItemIds.some(isTabClosed)) {
    group2.push({
      title: 'ツリーに紐づくタブをバックグラウンドで開く',
      onClick: () => Command.openTreeTabs(),
    })
  }

  if (item.type === ItemType.CODE_BLOCK && isSingleSelect) {
    group3.push({
      title: 'コードブロックの言語を設定…',
      onClick: () => {
        External.instance.dialogState = { type: 'CodeBlockLanguageSettingDialog' }
      },
    })
  }

  if (isSingleSelect) {
    switch (item.type) {
      case ItemType.WEB_PAGE:
        group3.push({
          title: 'タイトルを設定…',
          onClick: () => Command.showEditDialog(),
        })
        break
      case ItemType.IMAGE:
        group3.push({
          title: '画像URLを編集…',
          onClick: () => Command.showEditDialog(),
        })
        break
      case ItemType.CODE_BLOCK:
        group3.push({
          title: 'コードブロックを編集…',
          onClick: () => Command.showEditDialog(),
        })
        break
      case ItemType.TEX:
        group3.push({
          title: 'TeXを編集…',
          onClick: () => Command.showEditDialog(),
        })
        break
    }
  }

  if (isSingleSelect && [ItemType.IMAGE, ItemType.CODE_BLOCK, ItemType.TEX].includes(item.type)) {
    group3.push({
      title: 'キャプションを設定…',
      onClick: () => {
        External.instance.dialogState = { type: 'CaptionSettingDialog' }
      },
    })
  }

  if (isSingleSelect && item.source !== null) {
    group3.push({
      title: '出典を編集…',
      onClick: () => Command.showSourceEditDialog(),
    })
    if (item.source.title === '' && item.source.url === '') {
      group3.push({
        title: '出典を削除',
        onClick: () => Command.toggleSource(),
      })
    }
  }

  if (includeTranscludedItem && isSingleSelect) {
    group4.push({
      title: '他のトランスクルード元を表示…',
      onClick: () => Command.showOtherParentsDialog(),
    })
  }

  group4.push({
    title: 'エクスポート…',
    onClick: () => Command.showExportDialog(),
  })

  if (isSingleSelect && targetItemId !== TOP_ITEM_ID) {
    if (CurrentState.getExcludedItemIds().includes(targetItemId)) {
      group4.push({
        title: 'ツリーの除外を解除',
        onClick: () => Command.toggleExcluded(),
      })
    } else {
      group4.push({
        title: 'ツリーを検索結果やサイドバーから除外',
        onClick: () => Command.toggleExcluded(),
      })
    }
  }

  return [group1, group2, group3, group4].filter((group) => group.length > 0)
}
