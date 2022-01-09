<script lang="ts">
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath.js'
  import SearchResultItem from 'src/TreeifyTab/View/Dialog/SearchResultItem.svelte'
  import { SearchResultItemProps } from 'src/TreeifyTab/View/Dialog/SearchResultItemProps'
  import { calculateFootprintColor } from 'src/TreeifyTab/View/footprint'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { createItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps.js'

  export let props: SearchResultItemProps

  $: footprintColor = calculateFootprintColor(
    props.footprintRank,
    props.footprintCount,
    '--page-tree-strongest-footprint-color',
    '--page-tree-weakest-footprint-color'
  )
  $: style = `
    --footprint-color: ${footprintColor ?? 'transparent'};
    --outer-circle-radius: ${props.outerCircleRadiusEm}em;
  `
</script>

<div class="search-result-item_root" {style}>
  <div class="search-result-item_roll">
    {#if props.children.length > 0}
      <div class="search-result-item_indent-guide" />
    {/if}
    <div class="search-result-item_roll-outer-circle" />
    <div class="search-result-item_bullet" />
  </div>
  <div class="search-result-item_content-and-children-area">
    <div
      class="search-result-item_content-area"
      tabindex="0"
      on:mousedown={props.onClick}
      on:keydown={props.onKeyDown}
    >
      <ItemContent props={createItemContentProps(ItemPath.getItemId(props.itemPath))} />
    </div>
    <div class="search-result-item_children-area">
      {#each props.children as child (child.itemPath.toString())}
        <SearchResultItem props={child} />
      {/each}
    </div>
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --search-result-line-height: 1.3em;
    --search-result-bullet-size: 0.38em;

    // 最も新しい足跡の色（線形補間の一端）。lch(97.5%, 134.0, 40.4)相当
    --search-result-page-tree-strongest-footprint-color: #fff6f3;
    // 最も古い足跡の色（線形補間の一端）
    --search-result-page-tree-weakest-footprint-color: #ffffff;
    --search-result-footprint-count-exponent: 0.5;

    --search-result-bullet-outer-circle-min-diameter: 1.05;
    --search-result-bullet-outer-circle-max-diameter: 1.3;
    // 外側の円が最大サイズになる子項目数
    --search-result-bullet-outer-circle-item-count-limit: 10;
  }

  .search-result-item_root {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);

    line-height: var(--search-result-line-height);
  }

  .search-result-item_roll {
    display: flex;
    flex-direction: column;
    align-items: center;

    position: relative;

    width: var(--search-result-line-height);
  }

  .search-result-item_indent-guide {
    width: 1px;
    height: calc(100% - var(--search-result-line-height) / 2);

    position: absolute;
    top: calc(var(--search-result-line-height) / 2);

    // lch(80.0%, 0.0, 0.0)相当
    background: #c6c6c6;
  }

  .search-result-item_roll-outer-circle {
    @include common.circle(var(--outer-circle-radius));

    position: absolute;
    top: calc(var(--search-result-line-height) / 2 - var(--outer-circle-radius) / 2);

    background: var(--main-area-bullet-outer-circle-color);
  }

  .search-result-item_bullet {
    @include common.circle(var(--search-result-bullet-size));

    position: absolute;
    top: calc(var(--search-result-line-height) / 2 - var(--search-result-bullet-size) / 2);

    background: var(--main-area-bullet-inner-circle-color);
  }

  .search-result-item_content-area {
    cursor: pointer;
    background-color: var(--footprint-color);

    &:focus {
      outline: none;
      background: var(--main-area-focused-item-background-color);
    }

    &:hover {
      background: var(--main-area-hover-item-background-color);
    }
  }
</style>
