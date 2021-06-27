<script lang="ts">
  import {DomishObject} from '../../Internal/DomishObject'
  import Cite from '../Cite.svelte'
  import Label from '../Label.svelte'
  import {ItemTreeContentView} from './ItemTreeContentProps'
  import {ItemTreeTextContentProps} from './ItemTreeTextContentProps'

  export let props: ItemTreeTextContentProps

  const id = ItemTreeContentView.focusableDomElementId(props.itemPath)
</script>

<div class="item-tree-text-content">
  {#if !props.labels.isEmpty()}
    <div class="item-tree-text-content_labels">
      {#each props.labels.toArray() as label}
        <Label props={{text: label}} />
      {/each}
    </div>
  {/if}
  <div
    class="item-tree-text-content_content-editable"
    {id}
    contenteditable="true"
    on:input={props.onInput}
    on:compositionend={props.onCompositionEnd}
    on:click={props.onClick}
  >
    {@html DomishObject.toHtml(props.domishObjects)}
  </div>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps}/>
  {/if}
</div>

<style>
  .item-tree-text-content_labels {
    float: left;

    /* テキストとの間に少し余白を入れないとくっつく */
    margin-right: 0.1em;
  }

  /* テキストアイテムのcontenteditableな要素 */
  .item-tree-text-content_content-editable {
    /* contenteditableな要素のフォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  /* グレーアウト状態のテキストアイテム */
  :global(.grayed-out) .item-tree-text-content_content-editable,
  :global(.grayed-out-children) .item-tree-text-content_content-editable {
    color: var(--grayed-out-item-text-color);
  }
</style>
