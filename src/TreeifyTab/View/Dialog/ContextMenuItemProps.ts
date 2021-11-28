import { List } from 'immutable'
import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { Command } from 'src/TreeifyTab/Internal/Command'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'

export type ContextMenuItemProps = {
  title: string
  onClick: () => void
}

export function createContextMenuItemPropses(): List<ContextMenuItemProps> {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const selectedItemIds = selectedItemPaths.map(ItemPath.getItemId)
  const subtreeItemIds = selectedItemIds.flatMap(CurrentState.getSubtreeItemIds)
  const isSingleSelect = selectedItemPaths.size === 1
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const item = Internal.instance.state.items[targetItemId]

  const result: ContextMenuItemProps[] = []

  if (ItemPath.hasParent(targetItemPath)) {
    result.push({
      title: '削除',
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

  if (CurrentState.countParents(targetItemId) >= 2 && isSingleSelect) {
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
      onClick: () => Command.showCitationSettingDialog(),
    })
    if (item.cite?.title === '' && item.cite.url === '') {
      result.push({
        title: '出典を削除',
        onClick: () => Command.toggleCitation(),
      })
    }
  }

  if (isSingleSelect) {
    if (CurrentState.getExcludedItemIds().contains(targetItemId)) {
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

  return List(result)
}
