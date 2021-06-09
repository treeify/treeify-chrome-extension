<script lang="ts">
  import {List} from 'immutable'
  import {ItemId} from '../../basicType'
  import {CurrentState} from '../../Internal/CurrentState'
  import ItemContent, {createItemContentProps} from '../ItemContent/ItemContent.svelte'
  import CommonDialog from './CommonDialog.svelte'

  type OtherParentsDialogViewModel = {
    itemIds: List<ItemId>
  }

  export let viewModel: OtherParentsDialogViewModel

  const closeDialog = () => {
    // ダイアログを閉じる
    CurrentState.setOtherParentsDialog(null)
    CurrentState.commit()
  }
</script>

<CommonDialog title="他のトランスクルード元" onCloseDialog={closeDialog}>
  <div class="other-parents-dialog_content">
    <div class="other-parents-dialog_item-content-list">
      {#each viewModel.itemIds.toArray() as itemId}
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
