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
  <div class="main-area-image-content_image-with-resize-handle">
    <img class="main-area-image-content_image" src={props.url} draggable="false" {style} />
    <div
      class="main-area-image-content_resize-handle"
      use:dragImageBottom={ItemPath.getItemId(props.itemPath)}
    />
  </div>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style global>
  /* 画像項目のコンテンツ領域のルート */
  .main-area-image-content {
    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  .main-area-image-content_image-with-resize-handle {
    position: relative;

    width: max-content;

    /*
    Treeifyタブと同じ背景色の画像（スクショなど）の境界線が分からない問題の対策。
    lch(90.0%, 0.0, 0.0)
    */
    outline: 1px solid #e2e2e2;
  }

  .main-area-image-content_image {
    width: auto;
    /* heightはstyle属性で指定する */
  }

  /* グレーアウト状態の画像 */
  .grayed-out .main-area-image-content_image {
    filter: opacity(50%);
  }

  .main-area-image-content_resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;

    --size: 20px;
    width: var(--size);
    height: var(--size);
    /* lch(35.0%, 0.0, 0.0)相当 */
    --border: 3px solid #525252;
    border-right: var(--border);
    border-bottom: var(--border);

    cursor: ns-resize;

    visibility: hidden;
  }
  .main-area-image-content_image-with-resize-handle:hover .main-area-image-content_resize-handle {
    visibility: visible;
  }
</style>
