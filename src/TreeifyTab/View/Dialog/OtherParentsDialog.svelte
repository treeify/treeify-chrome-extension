<script lang="ts">
  import CommonDialog from './CommonDialog.svelte'
  import OtherParentsDialogItem from './OtherParentsDialogItem.svelte'
  import {OtherParentsDialogProps} from './OtherParentsDialogProps'

  export let props: OtherParentsDialogProps
</script>

<CommonDialog title="他のトランスクルード元" showCloseButton>
  <div class="other-parents-dialog_content" tabindex="0">
    {#each props.itemPropses.toArray() as itemProps}
      <OtherParentsDialogItem props={itemProps} />
    {/each}
  </div>
</CommonDialog>

<style global lang="scss">
  .other-parents-dialog_content {
    min-width: 15em;
    padding: 1em;

    display: flex;
    flex-direction: column;
    row-gap: 0.3em;

    outline: none;
  }
</style>
