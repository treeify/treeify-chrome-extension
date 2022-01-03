<script lang="ts">
  import { OtherParentsDialogItemProps } from 'src/TreeifyTab/View/Dialog/OtherParentsDialogItemProps'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'

  export let props: OtherParentsDialogItemProps
</script>

<div class="other-parents-dialog-item_root" on:click={props.onClick}>
  <ItemContent props={props.itemContentProps} />
</div>

<style global lang="scss">
  .other-parents-dialog-item_root {
    cursor: pointer;

    &:hover {
      background: var(--main-area-hover-item-background-color);
    }
  }
</style>
