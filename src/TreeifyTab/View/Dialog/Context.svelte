<script lang="ts">
  import { ContextProps } from 'src/TreeifyTab/View/Dialog/ContextProps'
  import ContextSibling from 'src/TreeifyTab/View/Dialog/ContextSibling.svelte'
  import { createContextSiblingProps } from 'src/TreeifyTab/View/Dialog/ContextSiblingProps'
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
      <ContextSibling
        props={createContextSiblingProps(siblingItemId, siblingItemId === props.selfItemId)}
      />
    {/each}
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --context-item-line-height: #{common.toIntegerPx(1.3em)};
  }

  .context_root {
    line-height: var(--context-item-line-height);
  }

  .context_page {
    display: flex;
    align-items: center;
    gap: common.toIntegerPx(0.2em);
  }

  .context_page-icon {
    @include common.size(common.toIntegerPx(1em));

    @include common.icon(var(--page-icon-color), url('page.svg'));
  }

  .context_frame {
    border: solid 1px lch(70% 0 0);
    border-radius: common.toIntegerPx(0.7em);
    padding: common.toIntegerPx(0.5em) common.toIntegerPx(0.5em) common.toIntegerPx(0.5em)
      common.toIntegerPx(1em);

    cursor: pointer;

    &:hover {
      border-color: lch(30% 0 0);
    }
  }
</style>
