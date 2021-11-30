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
    }
  }

  function onSubmit() {
    Internal.instance.saveCurrentStateToUndoStack()

    const itemIds = Internal.instance.searchEngine.searchToReplace(beforeReplace)
    for (const itemId of itemIds) {
      replaceItemData(itemId, beforeReplace, afterReplace)
    }
    alert(`${itemIds.size}項目のテキストを置換しました。`)

    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function replaceItemData(itemId: ItemId, beforeReplace: string, afterReplace: string) {
    const state = Internal.instance.state
    const type = state.items[itemId].type
    switch (type) {
      case ItemType.TEXT:
        const domishObjects = state.textItems[itemId].domishObjects
        const newDomishObjects = domishObjects.map((domishObject) =>
          DomishObject.replace(domishObject, beforeReplace, afterReplace)
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
  }
</script>

<CommonDialog title="置換" showCloseButton>
  <div class="text-replace-dialog_content" on:keydown={onKeydown}>
    <div class="text-replace-dialog_input-area">
      <label class="text-replace-dialog_label">
        置換前
        <input type="text" class="text-replace-dialog_before-replace" bind:value={beforeReplace} />
      </label>
      <label class="text-replace-dialog_label">
        置換後
        <input type="text" class="text-replace-dialog_after-replace" bind:value={afterReplace} />
      </label>
    </div>
    <div class="text-replace-dialog_button-area">
      <button class="text-replace-dialog_submit-button" on:click={onSubmit}>全て置換</button>
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .text-replace-dialog_content {
    min-width: 25em;
    padding: 1em;
  }

  .text-replace-dialog_input-area {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-gap: 0.5em;
  }

  .text-replace-dialog_label {
    display: contents;
  }

  .text-replace-dialog_button-area {
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
