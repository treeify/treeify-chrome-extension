<script lang="ts">
  import { AdjacentItemsProps } from 'src/TreeifyTab/View/Dialog/AdjacentItemsProps'
  import AdjacentSiblingItem from 'src/TreeifyTab/View/Dialog/AdjacentSiblingItem.svelte'
  import { createAdjacentSiblingItemProps } from 'src/TreeifyTab/View/Dialog/AdjacentSiblingItemProps'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { createItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

  export let props: AdjacentItemsProps
</script>

<div class="adjacent-items_root">
  <div class="adjacent-items_page">
    <div class="adjacent-items_page-icon" />
    <ItemContent props={createItemContentProps(props.pageId)} />
  </div>
  <div class="adjacent-items_frame" on:mousedown={props.onClick}>
    <ItemContent props={createItemContentProps(props.parentItemId)} />
    {#each props.nearSiblingItemIds as siblingItemId}
      <AdjacentSiblingItem
        props={createAdjacentSiblingItemProps(siblingItemId, siblingItemId === props.selfItemId)}
      />
    {/each}
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --adjacent-item-line-height: #{common.toIntegerPx(1.5em)};
  }

  .adjacent-items_root {
    line-height: var(--adjacent-item-line-height);
  }

  .adjacent-items_page {
    display: flex;
    align-items: center;
    gap: common.toIntegerPx(0.2em);
  }

  .adjacent-items_page-icon {
    @include common.size(common.toIntegerPx(1em));

    @include common.icon(var(--page-icon-color), url('page.svg'));
  }

  .adjacent-items_frame {
    border: solid 1px oklch(70% 0 0);
    border-radius: common.toIntegerPx(0.7em);
    padding: common.toIntegerPx(0.5em) common.toIntegerPx(0.5em) common.toIntegerPx(0.5em)
      common.toIntegerPx(1em);

    cursor: pointer;

    &:hover {
      border-color: oklch(30% 0 0);
    }
  }
</style>
