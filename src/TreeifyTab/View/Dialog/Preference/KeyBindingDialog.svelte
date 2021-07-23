<script lang="ts">
  import CommonDialog from '../CommonDialog.svelte'
  import KeyBinding from './KeyBinding.svelte'
  import {KeyBindingDialogProps} from './KeyBindingDialogProps'

  export let props: KeyBindingDialogProps
</script>

<CommonDialog title="キーボード操作設定" showCloseButton>
  <div class="key-binding-dialog_content">
    <div class="key-binding-dialog_table">
      {#each props.keyBindingPropses.toArray() as keyBindingProps}
        <KeyBinding props={keyBindingProps} />
      {/each}
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
</style>
