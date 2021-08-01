<script lang="ts">
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import CommonDialog from './CommonDialog.svelte'
  import {OtherParentsDialogProps} from './OtherParentsDialogProps'

  export let props: OtherParentsDialogProps
</script>

<CommonDialog title="他のトランスクルード元" showCloseButton="true">
  <div class="other-parents-dialog_content" tabindex="0">
    <div class="other-parents-dialog_item-content-list">
      {#each props.itemContentPropses.toArray() as itemContentProps}
        <div class="other-parents-dialog_row-wrapper">
          <ItemContent props={itemContentProps} />
        </div>
      {/each}
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .other-parents-dialog_content {
    min-width: 15em;
    padding: 1em;

    outline: none;
  }

  .other-parents-dialog_row-wrapper {
    display: flex;
    align-items: center;

    margin-top: 0.3em;

    &:first-child {
      margin-top: 0;
    }
  }
</style>
