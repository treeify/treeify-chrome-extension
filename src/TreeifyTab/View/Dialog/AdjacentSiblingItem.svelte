<script lang="ts">
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { AdjacentSiblingItemProps } from 'src/TreeifyTab/View/Dialog/AdjacentSiblingItemProps'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { createItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

  export let props: AdjacentSiblingItemProps
</script>

<div
  class="adjacent-sibling-item_bullet-and-content"
  style:--outer-circle-size="{props.outerCircleSizeEm}em"
>
  <div class="adjacent-sibling-item_bullet-area">
    {#if CurrentState.isPage(props.itemId)}
      <div
        class="adjacent-sibling-item_page-icon"
        class:transcluded={CurrentState.countParents(props.itemId) > 1}
      />
    {:else}
      <div class="adjacent-sibling-item_bullet-outer-circle" />
      <div
        class="adjacent-sibling-item_bullet"
        class:transcluded={CurrentState.countParents(props.itemId) > 1}
      />
    {/if}
  </div>
  <div class="adjacent-sibling-item_content-area" class:myself={props.isMyself}>
    <ItemContent props={createItemContentProps(props.itemId)} />
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .adjacent-sibling-item_bullet-and-content {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .adjacent-sibling-item_bullet-area {
    @include common.size(var(--adjacent-item-line-height));

    position: relative;
  }

  .adjacent-sibling-item_page-icon {
    @include common.absolute-center;
    @include common.size(common.toIntegerPx(1em));

    @include common.icon(var(--page-icon-color), url('page.svg'));

    &.transcluded {
      background: var(--transcluded-item-page-icon-color);
    }
  }

  .adjacent-sibling-item_bullet-outer-circle {
    @include common.circle(var(--outer-circle-size));
    @include common.absolute-center;

    background: var(--bullet-outer-circle-color);
  }

  .adjacent-sibling-item_bullet {
    @include common.absolute-center;
    @include common.circle(var(--bullet-size));

    background: var(--bullet-color);

    &.transcluded {
      background: var(--transcluded-item-bullet-color);
    }
  }

  .adjacent-sibling-item_content-area {
    &.myself {
      background: var(--selected-item-background-color);
    }
  }
</style>
