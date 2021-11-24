import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { assertNonUndefined } from 'src/Utility/Debug/assert'

export type CaptionSettingDialogProps = {
  initialCaption: string
  onSubmit: (newCaption: string) => void
  onClickCancelButton: () => void
}

export function createCaptionSettingDialogProps(): CaptionSettingDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const caption = getCaption(targetItemId)
  assertNonUndefined(caption)

  return {
    initialCaption: caption,
    onSubmit: (newCaption: string) => {
      setCaption(targetItemId, newCaption)
      CurrentState.updateItemTimestamp(targetItemId)

      // ダイアログを閉じる
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
    onClickCancelButton: () => {
      // ダイアログを閉じる
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
  }
}

function getCaption(itemId: ItemId): string | undefined {
  const state = Internal.instance.state
  switch (state.items[itemId].type) {
    case ItemType.IMAGE:
      return state.imageItems[itemId].caption
    case ItemType.CODE_BLOCK:
      return state.codeBlockItems[itemId].caption
    case ItemType.TEX:
      return state.texItems[itemId].caption
    default:
      return undefined
  }
}

function setCaption(itemId: ItemId, caption: string) {
  switch (Internal.instance.state.items[itemId].type) {
    case ItemType.IMAGE:
      Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
        Internal.instance.mutate(caption, PropertyPath.of('imageItems', itemId, 'caption'))
      })
      break
    case ItemType.CODE_BLOCK:
      Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
        Internal.instance.mutate(caption, PropertyPath.of('codeBlockItems', itemId, 'caption'))
      })
      break
    case ItemType.TEX:
      Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
        Internal.instance.mutate(caption, PropertyPath.of('texItems', itemId, 'caption'))
      })
      break
  }
}
