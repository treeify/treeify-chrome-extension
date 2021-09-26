<script lang="ts">
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import CommonDialog from './CommonDialog.svelte'
  import {OtherParentsDialogProps} from './OtherParentsDialogProps'

  export let props: OtherParentsDialogProps
</script>

<CommonDialog title="他のトランスクルード元" showCloseButton>
  <div class="other-parents-dialog_content" tabindex="0">
    {#each props.itemContentPropses.toArray() as itemContentProps}
      <div class="other-parents-dialog_row-wrapper">
        <ItemContent props={itemContentProps} />
      </div>
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
