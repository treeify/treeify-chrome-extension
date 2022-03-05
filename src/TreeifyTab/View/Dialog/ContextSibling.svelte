<script lang="ts">
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { ContextSiblingProps } from 'src/TreeifyTab/View/Dialog/ContextSiblingProps'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { createItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

  export let props: ContextSiblingProps
</script>

<div class="context-sibling_bullet-and-content">
  <div class="context-sibling_bullet-area">
    {#if CurrentState.isPage(props.itemId)}
      <div
        class="context-sibling_page-icon"
        class:transcluded={CurrentState.countParents(props.itemId) > 1}
      />
    {:else}
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
    @include common.flex-center;
  }

  .context-sibling_page-icon {
    @include common.size(1em);

    @include common.icon(var(--page-icon-color), url('page.svg'));
  }

  .context-sibling_bullet {
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
