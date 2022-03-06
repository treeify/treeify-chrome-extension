<script lang="ts">
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { ContextSiblingProps } from 'src/TreeifyTab/View/Dialog/ContextSiblingProps'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { createItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

  export let props: ContextSiblingProps
</script>

<div
  class="context-sibling_bullet-and-content"
  style:--outer-circle-radius="{props.outerCircleRadiusEm}em"
>
  <div class="context-sibling_bullet-area">
    {#if CurrentState.isPage(props.itemId)}
      <div
        class="context-sibling_page-icon"
        class:transcluded={CurrentState.countParents(props.itemId) > 1}
      />
    {:else}
      <div class="context-sibling_bullet--outer-circle" />
      <div
        class="context-sibling_bullet"
        class:transcluded={CurrentState.countParents(props.itemId) > 1}
      />
    {/if}
  </div>
  <div class="context-sibling_content-area" class:myself={props.isMyself}>
    <ItemContent props={createItemContentProps(props.itemId)} />
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .context-sibling_bullet-and-content {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .context-sibling_bullet-area {
    @include common.size(var(--context-item-line-height));

    position: relative;
  }

  .context-sibling_page-icon {
    @include common.absolute-center;
    @include common.size(common.toIntegerPx(1em));

    @include common.icon(var(--page-icon-color), url('page.svg'));
  }

  .context-sibling_bullet--outer-circle {
    @include common.circle(var(--outer-circle-radius));
    @include common.absolute-center;

    background: var(--bullet-outer-circle-color);
  }

  .context-sibling_bullet {
    @include common.absolute-center;
    @include common.circle(var(--bullet-size));

    background: var(--bullet-color);

    &.transcluded {
      background: var(--transcluded-item-bullet-color);
    }
  }

  .context-sibling_content-area {
    &.myself {
      background: var(--selected-item-background-color);
    }
  }
</style>
