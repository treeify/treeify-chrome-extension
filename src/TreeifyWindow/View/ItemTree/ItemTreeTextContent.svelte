<script lang="ts">
  import {List} from 'immutable'
  import {ItemType} from '../../basicType'
  import {DomishObject} from '../../Internal/DomishObject'
  import {ItemPath} from '../../Internal/ItemPath'
  import Label from '../Label.svelte'
  import {ItemTreeContentView} from './ItemTreeContentView'

  type ItemTreeTextContentViewModel = {
    itemPath: ItemPath
    itemType: ItemType.TEXT
    labels: List<string>
    domishObjects: List<DomishObject>
    onInput: (event: InputEvent) => void
    onCompositionEnd: (event: CompositionEvent) => void
    onClick: (event: Event) => void
  }

  export let viewModel: ItemTreeTextContentViewModel

  const id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)
</script>

<div class="item-tree-text-content">
  {#if !viewModel.labels.isEmpty()}
    <div class="item-tree-text-content_labels">
      {#each viewModel.labels.toArray() as label}
        <Label text={label} />
      {/each}
    </div>
  {/if}
  <div
    class="item-tree-text-content_content-editable"
    {id}
    contenteditable="true"
    on:input={viewModel.onInput}
    on:compositionend={viewModel.onCompositionEnd}
    on:click={viewModel.onClick}
  >
    {@html DomishObject.toHtml(viewModel.domishObjects)}
  </div>
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
