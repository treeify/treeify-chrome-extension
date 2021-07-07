<script lang="ts">
  import {DomishObject} from '../../Internal/DomishObject'
  import Cite from '../Cite.svelte'
  import {MainAreaContentView} from './MainAreaContentProps'
  import {MainAreaTextContentProps} from './MainAreaTextContentProps'
  
  export let props: MainAreaTextContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-text-content">
  <div
    class="main-area-text-content_content-editable"
    {id}
    contenteditable="true"
    on:input={props.onInput}
    on:compositionend={props.onCompositionEnd}
    on:mousedown={props.onClick}
  >
    {@html DomishObject.toHtml(props.domishObjects)}
  </div>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style>
  /* テキストアイテムのcontenteditableな要素 */
  .main-area-text-content_content-editable {
    /* contenteditableな要素のフォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  /* グレーアウト状態のテキストアイテム */
  :global(.grayed-out) .main-area-text-content_content-editable,
  :global(.grayed-out-children) .main-area-text-content_content-editable {
    color: var(--grayed-out-item-text-color);
  }
</style>
