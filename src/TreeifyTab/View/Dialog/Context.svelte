<script lang="ts">
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { ContextProps } from 'src/TreeifyTab/View/Dialog/ContextProps'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { createItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'

  export let props: ContextProps
</script>

<div class="context_root">
  <div class="context_page">
    <div class="context_page-icon" />
    <ItemContent props={createItemContentProps(props.pageId)} />
  </div>
  <div class="context_frame" on:mousedown={props.onClick}>
    <ItemContent props={createItemContentProps(props.parentItemId)} />
    {#each props.nearSiblingItemIds as siblingItemId}
      <div class="context_bullet-and-content">
        <div class="context_bullet-area">
          {#if CurrentState.isPage(siblingItemId)}
            <div
              class="context_page-icon"
              class:transcluded={CurrentState.countParents(siblingItemId) > 1}
            />
          {:else}
            <div
              class="context_bullet"
              class:transcluded={CurrentState.countParents(siblingItemId) > 1}
            />
          {/if}
        </div>
        <div class="context_content-area" class:myself={siblingItemId === props.selfItemId}>
          <ItemContent props={createItemContentProps(siblingItemId)} />
        </div>
      </div>
    {/each}
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --context-item-line-height: 1.3em;
  }

  .context_root {
    line-height: var(--context-item-line-height);
  }

  .context_page {
    display: flex;
    align-items: center;
    gap: 0.2em;
  }

  .context_page-icon {
    @include common.size(1em);

    @include common.icon(lch(30% 0 0), url('page.svg'));
  }

  .context_frame {
    border: solid 1px lch(70% 0 0);
    border-radius: 0.7em;
    padding: 0.5em 0.5em 0.5em 1em;

    cursor: pointer;

    &:hover {
      border-color: lch(30% 0 0);
    }
  }

  .context_bullet-and-content {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .context_bullet-area {
    @include common.size(var(--context-item-line-height));
    @include common.flex-center;
  }

  .context_bullet {
    @include common.circle(var(--bullet-size));

    background: var(--bullet-color);

    &.transcluded {
      background: var(--transcluded-item-bullet-color);
    }
  }

  .context_content-area {
    &.myself {
      background: var(--selected-item-background-color);
    }
  }
</style>
