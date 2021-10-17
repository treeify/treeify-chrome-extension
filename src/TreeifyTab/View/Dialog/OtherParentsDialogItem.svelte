<script lang="ts">
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import {OtherParentsDialogItemProps} from './OtherParentsDialogItemProps'

  export let props: OtherParentsDialogItemProps
</script>

<div class="other-parents-dialog-item" on:click={props.onClick}>
  <ItemContent props={props.itemContentProps} />
</div>

<style global lang="scss">
  .other-parents-dialog-item {
    cursor: pointer;

    &:hover {
      background: var(--main-area-mouse-hover-item-background-color);
    }
  }
</style>
