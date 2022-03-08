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

<div
  class="tabs-dialog-item_root"
  style:--footprint-color={footprintColor ?? 'transparent'}
  style:--outer-circle-radius="{props.outerCircleRadiusEm}em"
>
  <div class="tabs-dialog-item_bullet-and-indent">
    {#if props.children.length > 0}
      <div class="tabs-dialog-item_indent-area">
        <div class="tabs-dialog-item_indent-guide" />
      </div>
    {/if}
    <div class="tabs-dialog-item_bullet-area">
      <div class="tabs-dialog-item_bullet-outer-circle" />
      <div class="tabs-dialog-item_bullet" />
    </div>
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
    --tabs-dialog-item-line-height: #{common.toIntegerPx(1.5em)};
  }

  .tabs-dialog-item_root {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);

    line-height: var(--tabs-dialog-item-line-height);
  }

  .tabs-dialog-item_bullet-and-indent {
    position: relative;

    width: var(--tabs-dialog-item-line-height);
  }

  .tabs-dialog-item_indent-area {
    position: absolute;
    // バレットの中心のY座標から子リストの下端までの領域にする
    padding-top: calc(var(--tabs-dialog-item-line-height) / 2);
    @include common.size(100%);

    @include common.flex-center;
  }

  .tabs-dialog-item_indent-guide {
    width: 1px;
    height: 100%;

    background: var(--indent-guide-color);
  }

  .tabs-dialog-item_bullet-area {
    @include common.size(var(--tabs-dialog-item-line-height));

    // 外側の円と内側の円を重ねて描画するための設定
    position: relative;
  }

  .tabs-dialog-item_bullet-outer-circle {
    @include common.circle(var(--outer-circle-radius));
    @include common.absolute-center;

    background: var(--bullet-outer-circle-color);
  }

  .tabs-dialog-item_bullet {
    @include common.circle(var(--bullet-size));
    @include common.absolute-center;

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
    @include common.size(common.toIntegerPx(1em));

    @include common.icon(oklch(50% 0 0), url('audible.svg'));

    margin-left: common.toIntegerPx(0.5em);
  }
</style>
