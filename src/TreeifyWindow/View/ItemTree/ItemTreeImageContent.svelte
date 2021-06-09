<script lang="ts">
  import {List} from 'immutable'
  import {ItemType} from '../../basicType'
  import {ItemPath} from '../../Internal/ItemPath'
  import Label from '../Label.svelte'
  import {ItemTreeContentView} from './ItemTreeContentView'

  type ItemTreeImageContentViewModel = {
    itemPath: ItemPath
    labels: List<string>
    itemType: ItemType.IMAGE
    url: string
    caption: string
    onFocus: (event: FocusEvent) => void
    onClick: (event: Event) => void
  }

  export let viewModel: ItemTreeImageContentViewModel

  const id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)
</script>

<div
  class="item-tree-image-content"
  {id}
  tabindex="0"
  on:focus={viewModel.onFocus}
  on:click={viewModel.onClick}
>
  {#if !viewModel.labels.isEmpty()}
    <div class="item-tree-image-content_labels">
      {#each viewModel.labels.toArray() as label}
        <Label text={label} />
      {/each}
    </div>
  {/if}

  <div class="item-tree-image-content_image-and-caption">
    <img class="item-tree-image-content_image" src={viewModel.url} />
    <div class="item-tree-image-content_caption">{viewModel.caption}</div>
  </div>
</div>

<style>
  /* 画像アイテムのコンテンツ領域のルート */
  .item-tree-image-content {
    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  /* 画像とキャプションを中央揃えにする */
  .item-tree-image-content_image-and-caption {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* これを指定しないとアイテムツリーの横幅に対する中央揃えになる。それはそれでありだがデフォルトは左寄せにする */
    width: fit-content;
  }

  .item-tree-image-content_image {
    /* 画像が表示領域の横幅をはみ出さないよう設定 */
    max-width: 100%;
    height: auto;
  }

  /* グレーアウト状態の画像 */
  :global(.grayed-out) .item-tree-image-content_image {
    filter: opacity(50%);
  }

  /* グレーアウト状態のキャプション */
  :global(.grayed-out) .item-tree-image-content_caption {
    color: hsl(0, 0%, 50%);
  }
</style>
