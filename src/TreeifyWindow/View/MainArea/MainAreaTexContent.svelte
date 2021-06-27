<script lang="ts">
  import katex from 'katex'
  import Cite from '../Cite.svelte'
  import Label from '../Label.svelte'
  import {ItemTreeContentView} from './MainAreaContentProps'
  import {MainAreaTexContentProps} from './MainAreaTexContentProps'

  export let props: MainAreaTexContentProps

  const id = ItemTreeContentView.focusableDomElementId(props.itemPath)
</script>

<div
  class="item-tree-tex-content"
  {id}
  tabindex="0"
  on:focus={props.onFocus}
  on:click={props.onClick}
>
  {#if !props.labels.isEmpty()}
    <div class="item-tree-tex-content_labels">
      {#each props.labels.toArray() as label}
        <Label props={{text: label}} />
      {/each}
    </div>
  {/if}
  <div class="item-tree-tex-content_rendered-tex">
    {@html katex.renderToString(props.code, {throwOnError: false})}
  </div>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style>
  /* コードブロックアイテムのコンテンツ領域のルート */
  .item-tree-tex-content {
    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;

    min-height: var(--item-tree-calculated-line-height);
  }

  /* グレーアウト状態のコードブロックアイテム */
  :global(.grayed-out) .item-tree-tex-content {
    filter: opacity(50%);
  }
</style>
