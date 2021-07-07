<script lang="ts">
  import Cite from '../Cite.svelte'
  import {MainAreaContentView} from './MainAreaContentProps'
  import {MainAreaImageContentProps} from './MainAreaImageContentProps'
  
  export let props: MainAreaImageContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div
  class="main-area-image-content"
  {id}
  tabindex="0"
  on:focus={props.onFocus}
  on:mousedown={props.onClick}
>
  <div class="main-area-image-content_image-and-caption">
    <img class="main-area-image-content_image" src={props.url} />
    <div class="main-area-image-content_caption">{props.caption}</div>
  </div>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style>
  /* 画像アイテムのコンテンツ領域のルート */
  .main-area-image-content {
    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  /* 画像とキャプションを中央揃えにする */
  .main-area-image-content_image-and-caption {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* これを指定しないとメインエリアの横幅に対する中央揃えになる。それはそれでありだがデフォルトは左寄せにする */
    width: fit-content;
  }

  .main-area-image-content_image {
    /* 画像が表示領域の横幅をはみ出さないよう設定 */
    max-width: 100%;
    height: auto;

    /* Treeifyタブと同じ背景色の画像（スクショなど）の境界線が分からない問題の対策 */
    border: 1px solid hsl(0, 0%, 90%);
  }

  /* グレーアウト状態の画像 */
  :global(.grayed-out) .main-area-image-content_image {
    filter: opacity(50%);
  }

  /* グレーアウト状態のキャプション */
  :global(.grayed-out) .main-area-image-content_caption {
    color: hsl(0, 0%, 50%);
  }
</style>
