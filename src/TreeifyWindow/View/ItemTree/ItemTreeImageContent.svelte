<script lang="ts">
  import Label from '../Label.svelte'
  import {ItemTreeContentView} from './ItemTreeContentProps'
  import {ItemTreeImageContentProps} from './ItemTreeImageContentProps'

  export let props: ItemTreeImageContentProps

  const id = ItemTreeContentView.focusableDomElementId(props.itemPath)
</script>

<div
  class="item-tree-image-content"
  {id}
  tabindex="0"
  on:focus={props.onFocus}
  on:click={props.onClick}
>
  {#if !props.labels.isEmpty()}
    <div class="item-tree-image-content_labels">
      {#each props.labels.toArray() as label}
        <Label props={{text: label}} />
      {/each}
    </div>
  {/if}

  <div class="item-tree-image-content_image-and-caption">
    <img class="item-tree-image-content_image" src={props.url} />
    <div class="item-tree-image-content_caption">{props.caption}</div>
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
