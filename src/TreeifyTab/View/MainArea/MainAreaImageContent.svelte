<script lang="ts">
  import {ItemPath} from '../../Internal/ItemPath'
  import Cite from '../Cite.svelte'
  import {dragImageBottom} from '../dragAndDrop'
  import {MainAreaContentView} from './MainAreaContentProps'
  import {MainAreaImageContentProps} from './MainAreaImageContentProps'

  export let props: MainAreaImageContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
  $: style = `
    height: ${props.height};
  `
</script>

<div class="main-area-image-content" {id} tabindex="0" on:focus={props.onFocus}>
  <div class="main-area-image-content_image-and-caption">
    <img
      class="main-area-image-content_image"
      {style}
      src={props.url}
      draggable="false"
      use:dragImageBottom={ItemPath.getItemId(props.itemPath)}
    />
    <div class="main-area-image-content_caption" />
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
    width: auto;
    /* heightはstyle属性で指定する */

    /*
    Treeifyタブと同じ背景色の画像（スクショなど）の境界線が分からない問題の対策。
    lch(90.0%, 0.0, 0.0)
    */
    border: 1px solid #e2e2e2;
  }

  /* グレーアウト状態の画像 */
  :global(.grayed-out) .main-area-image-content_image {
    filter: opacity(50%);
  }
</style>
