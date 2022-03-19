<script lang="ts">
  import { pipe } from 'fp-ts/function'
  import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { REPLACEMENT_RANGES, ReplacementRange } from 'src/TreeifyTab/Internal/State'
  import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import { ReplaceDialogProps } from 'src/TreeifyTab/View/Dialog/ReplaceDialogProps'
  import RadioButton from 'src/TreeifyTab/View/RadioButton.svelte'
  import { assertNeverType } from 'src/Utility/Debug/assert'
  import { RSet$ } from 'src/Utility/fp-ts'
  import { call } from 'src/Utility/function'

  export let props: ReplaceDialogProps

  let beforeReplace: string = props.initialBeforeReplace ?? ''
  let afterReplace: string = ''

  let selectedReplacementRange = Internal.instance.state.selectedReplacementRange
  $: Internal.instance.mutate(selectedReplacementRange, StatePath.of('selectedReplacementRange'))

  const replacementRangeLabels: Record<ReplacementRange, string> = {
    'all-pages': '全てのページ',
    'active-page-and-descendants': '現在のページとその子孫ページ',
  }

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
        External.instance.dialogState = { type: 'SearchDialog', initialSearchQuery: beforeReplace }
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

    const itemIds = call(() => {
      switch (selectedReplacementRange) {
        case 'all-pages':
          return Internal.instance.searchEngine.searchToReplace(beforeReplace)
        case 'active-page-and-descendants':
          const activePageId = CurrentState.getActivePageId()
          return pipe(
            Internal.instance.searchEngine.searchToReplace(beforeReplace),
            RSet$.filter(
              (itemId: ItemId) =>
                itemId === activePageId ||
                RSet$.from(CurrentState.yieldAncestorItemIds(itemId)).has(activePageId)
            )
          )
      }
    })

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
    <fieldset class="replace-dialog_range-area">
      <legend>置換範囲</legend>
      {#each REPLACEMENT_RANGES as replacementRange}
        <RadioButton bind:group={selectedReplacementRange} value={replacementRange}>
          {replacementRangeLabels[replacementRange]}
        </RadioButton>
      {/each}
    </fieldset>
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
    min-width: common.toIntegerPx(25em);
    padding: common.toIntegerPx(1em);
  }

  .replace-dialog_input-area {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-gap: common.toIntegerPx(0.5em);
    align-items: center;
  }

  .replace-dialog_label {
    display: contents;
  }

  .replace-dialog_before-replace,
  .replace-dialog_after-replace {
    padding: common.toIntegerPx(0.35em);
    font-size: 95%;
  }

  .replace-dialog_range-area {
    display: flex;
    flex-direction: column;
    // クリックの当たり判定が広がるのを防ぐ
    align-items: start;

    border: 1px solid oklch(85% 0 0);

    margin-top: 1em;
  }

  .replace-dialog_bottom-button-area {
    @include common.flex-right;

    margin-top: common.toIntegerPx(1em);
  }
</style>
