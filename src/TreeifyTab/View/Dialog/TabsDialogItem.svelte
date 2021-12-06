<script lang="ts">
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath.js'
  import TabsDialogItem from 'src/TreeifyTab/View/Dialog/TabsDialogItem.svelte'
  import { TabsDialogItemProps } from 'src/TreeifyTab/View/Dialog/TabsDialogItemProps'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { createItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps.js'

  export let props: TabsDialogItemProps
</script>

<div class="tabs-dialog-item_root">
  <div class="tabs-dialog-item_content-area" on:mousedown={props.onClick}>
    <ItemContent props={createItemContentProps(ItemPath.getItemId(props.itemPath))} />
  </div>
  <div class="tabs-dialog-item_indent-and-children-area">
    <div class="tabs-dialog-item_indent-area" />
    <div class="tabs-dialog-item_children-area">
      {#each props.children.toArray() as child}
        <TabsDialogItem props={child} />
      {/each}
    </div>
  </div>
</div>

<style global lang="scss">
  .tabs-dialog-item_content-area {
    cursor: pointer;

    &:hover {
      background: var(--main-area-mouse-hover-item-background-color);
    }
  }

  .tabs-dialog-item_indent-and-children-area {
    display: flex;
  }

  .tabs-dialog-item_indent-area {
    flex: 0 0 1.1em;
    // lch(80.0%, 0.0, 0.0)相当
    border-left: 1px solid #c6c6c6;
  }
</style>
