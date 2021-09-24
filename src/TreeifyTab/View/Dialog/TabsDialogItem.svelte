<script lang="ts">
  import {ItemPath} from '../../Internal/ItemPath.js'
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import {createItemContentProps} from '../ItemContent/ItemContentProps.js'
  import {TabsDialogItemProps} from './TabsDialogItemProps'

  export let props: TabsDialogItemProps
</script>

<div class="tabs-dialog-item" on:mousedown={props.onClick}>
  <ItemContent props={createItemContentProps(ItemPath.getItemId(props.itemPath))} />
</div>

<style global lang="scss">
  .tabs-dialog-item {
    cursor: pointer;

    &:hover {
      background: var(--main-area-mouse-hover-item-background-color);
    }
  }
</style>
