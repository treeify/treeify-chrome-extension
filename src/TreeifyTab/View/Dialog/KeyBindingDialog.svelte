<script lang="ts">
  import CommonDialog from './CommonDialog.svelte'
  import KeyBinding from './KeyBinding.svelte'
  import {KeyBindingDialogProps} from './KeyBindingDialogProps'

  export let props: KeyBindingDialogProps
</script>

<CommonDialog title="キーボード操作設定">
  <div class="key-binding-dialog_content">
    <div class="key-binding-dialog_table">
      {#each props.keyBindingPropses.toArray() as keyBindingProps}
        <KeyBinding props={keyBindingProps} />
      {/each}
    </div>
    <div class="key-binding-dialog_button-area">
      <button on:click={props.onClickFinishButton}>完了</button>
      <button on:click={props.onClickCancelButton}>キャンセル</button>
    </div>
  </div>
</CommonDialog>

<style global>
  .key-binding-dialog_content {
    padding: 1em;
  }

  .key-binding-dialog_table {
    display: grid;
    grid-template-columns: auto auto;
    grid-gap: 0.3em;
  }

  .key-binding-dialog_button-area {
    /* ボタン群を右寄せにする */
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
