<script lang="ts">
  import katex from 'katex'
  import Label from '../Label.svelte'
  import {ItemTreeContentView} from './ItemTreeContentProps'
  import {ItemTreeTexContentProps} from './ItemTreeTexContentProps'

  export let props: ItemTreeTexContentProps

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
  <div class="item-tree-tex-content_rendered-tex">{@html katex.renderToString(props.code)}</div>
</div>

<style>
  /* コードブロックアイテムのコンテンツ領域のルート */
  .item-tree-tex-content {
    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  /* グレーアウト状態のコードブロックアイテム */
  :global(.grayed-out) .item-tree-tex-content {
    filter: opacity(50%);
  }
</style>
