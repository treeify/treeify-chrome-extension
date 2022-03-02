<script lang="ts">
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import TabsDialogItem from 'src/TreeifyTab/View/Dialog/TabsDialogItem.svelte'
  import { TabsDialogItemProps } from 'src/TreeifyTab/View/Dialog/TabsDialogItemProps'
  import { calculateFootprintColor } from 'src/TreeifyTab/View/footprint'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { createItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

  export let props: TabsDialogItemProps

  $: footprintColor = calculateFootprintColor(
    props.footprintRank,
    props.footprintCount,
    '--newest-footprint-color',
    '--oldest-footprint-color'
  )?.toString()
</script>

<div class="tabs-dialog-item_root" style:--footprint-color={footprintColor ?? 'transparent'}>
  <div class="tabs-dialog-item_bullet-and-indent">
    {#if props.children.length > 0}
      <div class="tabs-dialog-item_indent-guide" />
    {/if}
    <div class="tabs-dialog-item_bullet" />
  </div>
  <div class="search-result-item_content-and-children-area">
    <div class="tabs-dialog-item_content-area" on:mousedown={props.onClick}>
      <ItemContent props={createItemContentProps(ItemPath.getItemId(props.itemPath))} />
      {#if props.isAudible}
        <div class="tabs-dialog-item_audible-icon" />
      {:else}
        <div class="grid-empty-cell" />
      {/if}
    </div>
    <div class="tabs-dialog-item_children-area">
      {#each props.children as child}
        <TabsDialogItem props={child} />
      {/each}
    </div>
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --tabs-dialog-item-line-height: 1.3em;
    --tabs-dialog-bullet-size: var(--bullet-size);
  }

  .tabs-dialog-item_root {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);

    line-height: var(--tabs-dialog-item-line-height);
  }

  .tabs-dialog-item_bullet-and-indent {
    display: flex;
    flex-direction: column;
    align-items: center;

    position: relative;

    width: var(--tabs-dialog-item-line-height);
  }

  .tabs-dialog-item_indent-guide {
    width: 1px;
    height: calc(100% - var(--tabs-dialog-item-line-height) / 2);

    position: absolute;
    top: calc(var(--tabs-dialog-item-line-height) / 2);

    background: var(--indent-guide-color);
  }

  .tabs-dialog-item_bullet {
    @include common.circle(var(--tabs-dialog-bullet-size));

    position: absolute;
    top: calc(var(--tabs-dialog-item-line-height) / 2 - var(--tabs-dialog-bullet-size) / 2);

    background: var(--bullet-color);
  }

  .tabs-dialog-item_content-area {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;

    background-color: var(--footprint-color);

    cursor: pointer;

    &:hover {
      background: var(--item-hover-background-color);
    }
  }

  .tabs-dialog-item_audible-icon {
    @include common.square(1em);

    @include common.icon(lch(50% 0 0), url('audible.svg'));

    margin-left: 0.5em;
  }
</style>
