import { List } from 'immutable'
import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { Command } from 'src/TreeifyTab/Internal/Command'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rist } from 'src/Utility/fp-ts'

export type ContextMenuItemProps = {
  title: string
  onClick(): void
}

export function createContextMenuItemPropses(): Rist.T<ContextMenuItemProps> {
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

  const result: ContextMenuItemProps[] = []

  if (hasParent) {
    result.push({
      title: '削除',
      onClick: () => Command.deleteItem(),
    })
  }

  if (hasParent && includeTranscludedItem) {
    result.push({
      title: '除去（トランスクルード先の項目自体は削除しない）',
      onClick: () => Command.removeItem(),
    })
  }

  const hasTab = (itemId: ItemId) =>
    External.instance.tabItemCorrespondence.getTabIdBy(itemId) !== undefined
  if (subtreeItemIds.some(hasTab)) {
    result.push({
      title: 'ツリーに紐づくタブを閉じる',
      onClick: () => Command.closeTreeTabs(),
    })
  }

  const isTabClosed = (itemId: ItemId) =>
    Internal.instance.state.items[itemId].type === ItemType.WEB_PAGE &&
    External.instance.tabItemCorrespondence.getTabIdBy(itemId) === undefined
  if (subtreeItemIds.some(isTabClosed)) {
    result.push({
      title: 'ツリーに紐づくタブをバックグラウンドで開く',
      onClick: () => Command.openTreeTabs(),
    })
  }

  if (includeTranscludedItem && isSingleSelect) {
    result.push({
      title: '他のトランスクルード元を表示…',
      onClick: () => Command.showOtherParentsDialog(),
    })
  }

  if (isSingleSelect) {
    switch (item.type) {
      case ItemType.WEB_PAGE:
        result.push({
          title: 'タイトルを設定…',
          onClick: () => Command.showEditDialog(),
        })
        break
      case ItemType.IMAGE:
        result.push({
          title: '画像URLを編集…',
          onClick: () => Command.showEditDialog(),
        })
        break
      case ItemType.CODE_BLOCK:
        result.push({
          title: 'コードブロックを編集…',
          onClick: () => Command.showEditDialog(),
        })
        break
      case ItemType.TEX:
        result.push({
          title: 'TeXを編集…',
          onClick: () => Command.showEditDialog(),
        })
        break
    }
  }

  if (item.type === ItemType.CODE_BLOCK && isSingleSelect) {
    result.push({
      title: 'コードブロックの言語を設定…',
      onClick: () => {
        External.instance.dialogState = { type: 'CodeBlockLanguageSettingDialog' }
      },
    })
  }

  if (process.env.NODE_ENV !== 'prod') {
    if (isSingleSelect) {
      result.push({
        title: 'リマインダーを設定…',
        onClick: () => {
          External.instance.dialogState = { type: 'ReminderSettingDialog' }
        },
      })
    }
  }

  if (
    isSingleSelect &&
    List.of(ItemType.IMAGE, ItemType.CODE_BLOCK, ItemType.TEX).contains(item.type)
  ) {
    result.push({
      title: 'キャプションを設定…',
      onClick: () => {
        External.instance.dialogState = { type: 'CaptionSettingDialog' }
      },
    })
  }

  result.push({
    title: 'エクスポート…',
    onClick: () => Command.showExportDialog(),
  })

  if (isSingleSelect) {
    result.push({
      title: '出典を設定…',
      onClick: () => Command.showSourceSettingDialog(),
    })
    if (item.source?.title === '' && item.source.url === '') {
      result.push({
        title: '出典を削除',
        onClick: () => Command.toggleSource(),
      })
    }
  }

  if (isSingleSelect) {
    if (CurrentState.getExcludedItemIds().includes(targetItemId)) {
      result.push({
        title: '現在のワークスペースからの除外を解除',
        onClick: () => Command.toggleExcluded(),
      })
    } else {
      result.push({
        title: '現在のワークスペースのページツリーや検索結果から除外',
        onClick: () => Command.toggleExcluded(),
      })
    }
  }

  const isCitation = selectedItemIds.some((itemId) => {
    const item = Internal.instance.state.items[itemId]
    return item.type === ItemType.TEXT && item.source !== null
  })
  if (isCitation) {
    result.push({
      title: '半角スペースを改行に変換',
      onClick: () => Command.convertSpaceToNewline(),
    })
  }

  return result
}
