<script lang="ts">
  import katex from 'katex'
  import Cite from '../Cite.svelte'
  import Label from '../Label.svelte'
  import {MainAreaContentView} from './MainAreaContentProps'
  import {MainAreaTexContentProps} from './MainAreaTexContentProps'

  export let props: MainAreaTexContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div
  class="main-area-tex-content"
  {id}
  tabindex="0"
  on:focus={props.onFocus}
  on:mousedown={props.onClick}
>
  {#if !props.labels.isEmpty()}
    <div class="main-area-tex-content_labels">
      {#each props.labels.toArray() as label}
        <Label props={{text: label}} />
      {/each}
    </div>
  {/if}
  <div class="main-area-tex-content_rendered-tex">
    {@html katex.renderToString(props.code, {throwOnError: false})}
  </div>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style>
  /* コードブロックアイテムのコンテンツ領域のルート */
  .main-area-tex-content {
    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;

    min-height: var(--main-area-calculated-line-height);
  }

  /* グレーアウト状態のコードブロックアイテム */
  :global(.grayed-out) .main-area-tex-content {
    filter: opacity(50%);
  }
</style>
