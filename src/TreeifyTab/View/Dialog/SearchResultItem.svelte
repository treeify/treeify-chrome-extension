<script lang="ts">
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import SearchResultItem from 'src/TreeifyTab/View/Dialog/SearchResultItem.svelte'
  import { SearchResultItemProps } from 'src/TreeifyTab/View/Dialog/SearchResultItemProps'
  import { calculateFootprintColor } from 'src/TreeifyTab/View/footprint'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { createItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

  export let props: SearchResultItemProps

  $: footprintColor = calculateFootprintColor(
    props.footprintRank,
    props.footprintCount,
    '--newest-footprint-color',
    '--oldest-footprint-color'
  )?.toString()
</script>

<div
  class="search-result-item_root"
  style:--footprint-color={footprintColor ?? 'transparent'}
  style:--outer-circle-radius="{props.outerCircleRadiusEm}em"
>
  <div
    class={`search-result-item_bullet-and-indent ${props.cssClasses.join(' ')}`}
    class:transcluded={props.isTranscluded}
  >
    {#if props.children.length > 0}
      <div class="search-result-item_indent-guide" />
    {/if}
    <div class="search-result-item_bullet-outer-circle" />
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
    --search-result-line-height: #{common.em(1.3)};

    --search-result-footprint-count-exponent: 0.5;
  }

  .search-result-item_root {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);

    line-height: var(--search-result-line-height);
  }

  .search-result-item_bullet-and-indent {
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

    background: var(--indent-guide-color);
  }

  .search-result-item_bullet-outer-circle {
    @include common.circle(var(--outer-circle-radius));

    position: absolute;
    top: calc(var(--search-result-line-height) / 2 - var(--outer-circle-radius) / 2);

    background: var(--bullet-outer-circle-color);
  }

  .search-result-item_bullet {
    @include common.circle(var(--bullet-size));

    position: absolute;
    top: calc(var(--search-result-line-height) / 2 - var(--bullet-size) / 2);

    background: var(--bullet-color);

    .transcluded & {
      background: var(--transcluded-item-bullet-color);
    }

    .highlighted & {
      background: var(--highlighted-item-bullet-color);
    }

    .transcluded.highlighted & {
      background: linear-gradient(
        to right,
        var(--highlighted-item-bullet-color) 50%,
        var(--transcluded-item-bullet-color) 50%
      );
    }
  }

  .search-result-item_content-area {
    cursor: pointer;
    background-color: var(--footprint-color);

    &:focus {
      outline: none;
      background: var(--selected-item-background-color);
    }

    &:hover {
      background: var(--item-hover-background-color);
    }
  }
</style>
