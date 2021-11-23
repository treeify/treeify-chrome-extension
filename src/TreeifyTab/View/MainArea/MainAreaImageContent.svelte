<script lang="ts">
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import Cite from 'src/TreeifyTab/View/Cite.svelte'
  import { dragImageBottom } from 'src/TreeifyTab/View/dragAndDrop'
  import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
  import { MainAreaImageContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaImageContentProps'
  import ResizeHandle from 'src/TreeifyTab/View/MainArea/ResizeHandle.svelte'

  export let props: MainAreaImageContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
  $: imageStyle = `
    width: ${props.width};
    aspect-ratio: ${props.aspectRatio};
  `

  function onLoad(event: Event) {
    if (event.target instanceof HTMLImageElement) {
      CurrentState.setImageItemOriginalSize(ItemPath.getItemId(props.itemPath), {
        widthPx: event.target.naturalWidth,
        heightPx: event.target.naturalHeight,
      })
    }
  }
</script>

<div class="main-area-image-content" {id} tabindex="0" on:focus={props.onFocus}>
  <table class="main-area-image-content_caption-layout">
    <div class="main-area-image-content_image-with-resize-handle">
      <img
        class="main-area-image-content_image"
        src={props.url}
        draggable="false"
        style={imageStyle}
        on:load={onLoad}
      />
      <div
        class="main-area-image-content_resize-handle"
        use:dragImageBottom={ItemPath.getItemId(props.itemPath)}
      >
        <ResizeHandle />
      </div>
    </div>
    {#if props.caption !== ''}
      <caption class="main-area-image-content_caption">{props.caption}</caption>
    {/if}
  </table>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style global lang="scss">
  // 画像項目のコンテンツ領域のルート
  .main-area-image-content {
    // フォーカス時の枠線を非表示
    outline: none;
  }

  .main-area-image-content_image-with-resize-handle {
    position: relative;

    width: max-content;
    max-width: 100%;

    // Treeifyタブと同じ背景色の画像（スクショなど）の境界線が分からない問題の対策。
    // lch(90.0%, 0.0, 0.0)
    outline: 1px solid #e2e2e2;
  }

  .main-area-image-content_image {
    // style属性でwidthとaspect-ratioが指定される
    max-width: 100%;

    // 完了状態の画像
    .completed &,
    .completed-children & {
      filter: opacity(50%);
    }
  }

  .main-area-image-content_resize-handle {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);

    height: 35%;
    min-height: 20px;
    max-height: 160px;

    width: max-content;

    visibility: hidden;

    .main-area-image-content_image-with-resize-handle:hover & {
      visibility: visible;
    }
  }

  .main-area-image-content_caption {
    caption-side: bottom;

    // 完了状態のキャプション
    .completed &,
    .completed-children & {
      // lch(50.0%, 0.0, 0.0)相当
      color: #777777;
    }
  }
</style>
