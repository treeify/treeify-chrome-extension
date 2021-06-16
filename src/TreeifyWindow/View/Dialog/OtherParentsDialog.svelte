<script lang="ts">
  import {CurrentState} from '../../Internal/CurrentState'
  import {Rerenderer} from '../../Rerenderer'
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import CommonDialog from './CommonDialog.svelte'
  import {OtherParentsDialogProps} from './OtherParentsDialogView'

  export let props: OtherParentsDialogProps

  const closeDialog = () => {
    // ダイアログを閉じる
    CurrentState.setOtherParentsDialog(null)
    Rerenderer.instance.rerender()
  }
</script>

<CommonDialog title="他のトランスクルード元" onCloseDialog={closeDialog}>
  <div class="other-parents-dialog_content">
    <div class="other-parents-dialog_item-content-list">
      {#each props.itemContentPropses.toArray() as itemContentProps}
        <div class="other-parents-dialog_row-wrapper">
          <ItemContent props={itemContentProps} />
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
