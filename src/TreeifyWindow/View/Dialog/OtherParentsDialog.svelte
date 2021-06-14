<script context="module" lang="ts">
  import {List} from 'immutable'
  import {ItemId} from '../../basicType'
  import {CurrentState} from '../../Internal/CurrentState'
  import {ItemPath} from '../../Internal/ItemPath'
  import ItemContent, {createItemContentProps} from '../ItemContent/ItemContent.svelte'
  import CommonDialog from './CommonDialog.svelte'

  export function createOtherParentsDialogProps() {
    const targetItemPath = CurrentState.getTargetItemPath()
    const parentItemIds = CurrentState.getParentItemIds(ItemPath.getItemId(targetItemPath))
    const targetParentItemId = ItemPath.getParentItemId(targetItemPath)
    const itemIds = parentItemIds.filter((itemId) => targetParentItemId !== itemId)
    return {itemIds}
  }
</script>

<script lang="ts">
  export let itemIds: List<ItemId>

  const closeDialog = () => {
    // ダイアログを閉じる
    CurrentState.setOtherParentsDialog(null)
    CurrentState.commit()
  }
</script>

<CommonDialog title="他のトランスクルード元" onCloseDialog={closeDialog}>
  <div class="other-parents-dialog_content">
    <div class="other-parents-dialog_item-content-list">
      {#each itemIds.toArray() as itemId}
        <div class="other-parents-dialog_row-wrapper">
          <ItemContent {...createItemContentProps(itemId)} />
        </div>
      {/each}
    </div>
    <button class="other-parents-dialog_close-button" on:click={closeDialog}>閉じる</button>
  </div>
</CommonDialog>

<style>
  .other-parents-dialog_content {
    width: 90vw;
    padding: 1em;

    font-size: 17px;
  }

  .other-parents-dialog_row-wrapper {
    display: flex;
    align-items: center;

    margin-top: 0.3em;
  }
  .other-parents-dialog_row-wrapper:first-child {
    margin-top: 0;
  }

  .other-parents-dialog_close-button {
    /* 右寄せにする */
    display: block;
    margin-left: auto;

    margin-top: 1em;
  }
</style>
