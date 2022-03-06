<script lang="ts">
  import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
  import { External } from 'src/TreeifyTab/External/External'
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import { assertNeverType } from 'src/Utility/Debug/assert'

  let beforeReplace: string = ''
  let afterReplace: string = ''

  function onKeydown(event: KeyboardEvent) {
    if (event.isComposing) return

    switch (InputId.fromKeyboardEvent(event)) {
      case '0000Enter':
      case '1000Enter':
        event.preventDefault()
        onSubmit()
        break
      case '1100KeyF':
        event.preventDefault()
        Command.showSearchDialog()
        Rerenderer.instance.rerender()
        break
      case '1100KeyR':
        event.preventDefault()
        document.querySelector<HTMLElement>('.replace-dialog_before-replace')?.focus()
        document.execCommand('selectAll')
        break
    }
  }

  function onSubmit() {
    Internal.instance.saveCurrentStateToUndoStack()

    const itemIds = Internal.instance.searchEngine.searchToReplace(beforeReplace)
    for (const itemId of itemIds) {
      replaceItemData(itemId, beforeReplace, afterReplace)
    }
    if (itemIds.size > 0) {
      alert(`${itemIds.size}項目を置換しました。`)
    } else {
      alert(`「${beforeReplace}」を含む項目はありません。`)
    }

    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function replaceItemData(itemId: ItemId, beforeReplace: string, afterReplace: string) {
    const state = Internal.instance.state
    const type = state.items[itemId].type
    switch (type) {
      case ItemType.TEXT:
        const domishObjects = state.textItems[itemId].domishObjects
        const nbsp = String.fromCharCode(160)
        const before = beforeReplace.replaceAll(' ', nbsp)
        const after = afterReplace.replaceAll(' ', nbsp)
        const newDomishObjects = domishObjects.map((domishObject) =>
          DomishObject.replace(domishObject, before, after)
        )
        CurrentState.setTextItemDomishObjects(itemId, newDomishObjects)
        break
      case ItemType.WEB_PAGE:
        const webPageItem = state.webPageItems[itemId]
        if (webPageItem.title !== null) {
          CurrentState.setWebPageItemTitle(
            itemId,
            webPageItem.title.replaceAll(beforeReplace, afterReplace)
          )
        }
        break
      case ItemType.IMAGE:
        const imageItem = state.imageItems[itemId]
        CurrentState.setImageItemCaption(
          itemId,
          imageItem.caption.replaceAll(beforeReplace, afterReplace)
        )
        break
      case ItemType.CODE_BLOCK:
        const codeBlockItem = state.codeBlockItems[itemId]
        CurrentState.setCodeBlockItemCode(
          itemId,
          codeBlockItem.code.replaceAll(beforeReplace, afterReplace)
        )
        CurrentState.setCodeBlockItemCaption(
          itemId,
          codeBlockItem.caption.replaceAll(beforeReplace, afterReplace)
        )
        break
      case ItemType.TEX:
        const texItem = state.texItems[itemId]
        CurrentState.setTexItemCode(itemId, texItem.code.replaceAll(beforeReplace, afterReplace))
        CurrentState.setTexItemCaption(
          itemId,
          texItem.caption.replaceAll(beforeReplace, afterReplace)
        )
        break
      default:
        assertNeverType(type)
    }

    CurrentState.updateItemTimestamp(itemId)
  }
</script>

<CommonDialog class="replace-dialog_root" title="置換" showCloseButton>
  <div class="replace-dialog_content" on:keydown={onKeydown}>
    <div class="replace-dialog_input-area">
      <label class="replace-dialog_label">
        置換前
        <input type="text" class="replace-dialog_before-replace" bind:value={beforeReplace} />
      </label>
      <label class="replace-dialog_label">
        置換後
        <input type="text" class="replace-dialog_after-replace" bind:value={afterReplace} />
      </label>
    </div>
    <div class="replace-dialog_bottom-button-area">
      <button class="replace-dialog_submit-button primary" on:mousedown|preventDefault={onSubmit}>
        全て置換
      </button>
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .replace-dialog_content {
    min-width: common.em(25);
    padding: common.em(1);
  }

  .replace-dialog_input-area {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-gap: common.em(0.5);
  }

  .replace-dialog_label {
    display: contents;
  }

  .replace-dialog_before-replace,
  .replace-dialog_after-replace {
    padding: common.em(0.35);
    font-size: 95%;
  }

  .replace-dialog_bottom-button-area {
    @include common.flex-right;

    margin-top: common.em(1);
  }
</style>
