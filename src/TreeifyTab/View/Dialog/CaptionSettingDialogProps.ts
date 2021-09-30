import {assertNonNull, assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemId, ItemType} from 'src/TreeifyTab/basicType'
import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export type CaptionSettingDialogProps = {
  initialCaption: string
  onClickFinishButton: () => void
  onClickCancelButton: () => void
  onKeyDown: (event: KeyboardEvent) => void
}

export function createCaptionSettingDialogProps(): CaptionSettingDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const caption = getCaption(targetItemId)
  assertNonUndefined(caption)

  const onClickFinishButton = () => {
    const editBox = document.querySelector<HTMLInputElement>('.caption-setting-dialog_caption')
    assertNonNull(editBox)
    const newCaption = editBox.value

    setCaption(targetItemId, newCaption)
    CurrentState.updateItemTimestamp(targetItemId)

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  return {
    initialCaption: caption,
    onClickFinishButton,
    onClickCancelButton: () => {
      // ダイアログを閉じる
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
    onKeyDown: (event) => {
      if (event.isComposing) return

      switch (InputId.fromKeyboardEvent(event)) {
        case '0000Enter':
        case '1000Enter':
          onClickFinishButton()
          break
      }
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
