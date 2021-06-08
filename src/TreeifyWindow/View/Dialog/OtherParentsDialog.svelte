<script lang="ts">
  import {List} from 'immutable'
  import {CurrentState} from '../../Internal/CurrentState'
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import {ItemContentViewModel} from '../ItemContent/ItemContentView'
  import CommonDialog from './CommonDialog.svelte'

  export type OtherParentsDialogViewModel = {
    itemContentViewModels: List<ItemContentViewModel>
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
      {#each viewModel.itemContentViewModels.toArray() as itemContentViewModel}
        <div class="other-parents-dialog_row-wrapper">
          <ItemContent viewModel={itemContentViewModel} />
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
