<script lang="ts">
  import {DomishObject} from '../../Internal/DomishObject'
  import Cite from '../Cite.svelte'
  import Label from '../Label.svelte'
  import {MainAreaContentView} from './MainAreaContentProps'
  import {MainAreaTextContentProps} from './MainAreaTextContentProps'

  export let props: MainAreaTextContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-text-content">
  {#if !props.labels.isEmpty()}
    <div class="main-area-text-content_labels">
      {#each props.labels.toArray() as label}
        <Label props={{text: label}} />
      {/each}
    </div>
  {/if}
  <div
    class="main-area-text-content_content-editable"
    {id}
    contenteditable="true"
    on:input={props.onInput}
    on:compositionend={props.onCompositionEnd}
    on:click={props.onClick}
  >
    {@html DomishObject.toHtml(props.domishObjects)}
  </div>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style>
  .main-area-text-content_labels {
    float: left;

    /* テキストとの間に少し余白を入れないとくっつく */
    margin-right: 0.1em;
  }

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
