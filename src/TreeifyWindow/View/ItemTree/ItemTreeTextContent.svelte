<script context="module" lang="ts">
  import {List} from 'immutable'
  import {doWithErrorCapture} from '../../errorCapture'
  import {getTextItemSelectionFromDom} from '../../External/domTextSelection'
  import {External} from '../../External/External'
  import {CurrentState} from '../../Internal/CurrentState'
  import {Derived} from '../../Internal/Derived'
  import {Internal} from '../../Internal/Internal'
  import {ItemPath} from '../../Internal/ItemPath'
  import Label from '../Label.svelte'
  import {ItemTreeContentView} from './ItemTreeContentView'

  export function createItemTreeTextContentProps(itemPath: ItemPath) {
    const itemId = ItemPath.getItemId(itemPath)
    return {
      itemPath,
      labels: Derived.getLabels(itemPath),
      innerHtml: Internal.instance.state.textItems[itemId].innerHtml,
      onInput: (event: InputEvent) => {
        doWithErrorCapture(() => {
          CurrentState.updateItemTimestamp(itemId)
        })
      },
      onClick: (event: MouseEvent) => {
        doWithErrorCapture(() => {
          CurrentState.setTargetItemPath(itemPath)

          // 再描画によってDOM要素が再生成され、キャレット位置がリセットされるので上書きするよう設定する
          External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())

          CurrentState.commit()
        })
      },
    }
  }
</script>

<script lang="ts">
  import {Readable, Writable} from 'svelte/store'

  export let itemPath: ItemPath
  export let labels: Readable<List<string>> | undefined
  export let innerHtml: Writable<string>
  export let onInput: (event: InputEvent) => void
  export let onClick: (event: MouseEvent) => void

  const id = ItemTreeContentView.focusableDomElementId(itemPath)
</script>

<div class="item-tree-text-content">
  {#if labels !== undefined && !$labels.isEmpty()}
    <div class="item-tree-text-content_labels">
      {#each $labels.toArray() as label}
        <Label text={label} />
      {/each}
    </div>
  {/if}
  <div
    class="item-tree-text-content_content-editable"
    {id}
    contenteditable="true"
    on:input={onInput}
    on:click={onClick}
    bind:innerHTML={$innerHtml}
  />
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
