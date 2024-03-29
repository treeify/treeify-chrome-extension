<script lang="ts">
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { dragImageResizeHandle } from 'src/TreeifyTab/View/dragAndDrop'
  import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
  import { MainAreaImageContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaImageContentProps'
  import ResizeHandle from 'src/TreeifyTab/View/MainArea/ResizeHandle.svelte'
  import Source from 'src/TreeifyTab/View/Source.svelte'

  export let props: MainAreaImageContentProps
  $: originalSize = props.originalSize ?? undefined

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)

  $: widthPx = props.widthPx ?? originalSize?.widthPx
  $: width = widthPx !== undefined ? `${widthPx}px` : 'auto'
  $: aspectRatio =
    originalSize !== undefined ? String(originalSize.widthPx / originalSize.heightPx) : 'auto'

  function onLoad(event: Event) {
    if (event.target instanceof HTMLImageElement) {
      originalSize = { widthPx: event.target.naturalWidth, heightPx: event.target.naturalHeight }
      CurrentState.setImageItemOriginalSize(ItemPath.getItemId(props.itemPath), {
        widthPx: event.target.naturalWidth,
        heightPx: event.target.naturalHeight,
      })
    }
  }
</script>

<div
  class="main-area-image-content_root"
  {id}
  style:--width={width}
  style:--aspect-ratio={aspectRatio}
  tabindex="0"
  on:focus={props.onFocus}
>
  <div class="main-area-image-content_image-with-resize-handle">
    <img
      class="main-area-image-content_image"
      src={props.url}
      alt=""
      draggable="false"
      on:load={onLoad}
    />
    <div
      class="main-area-image-content_resize-handle"
      use:dragImageResizeHandle={ItemPath.getItemId(props.itemPath)}
    >
      <ResizeHandle />
    </div>
  </div>
  {#if props.caption !== ''}
    <div class="main-area-image-content_caption">{props.caption}</div>
  {/if}
  {#if props.sourceProps !== undefined}
    <Source props={props.sourceProps} />
  {/if}
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .main-area-image-content_root {
    outline: none;

    max-width: 100%;
  }

  .main-area-image-content_image-with-resize-handle {
    background-color: oklch(100% 0 0);
    position: relative;

    width: max-content;
    max-width: 100%;

    // Treeifyタブと同じ背景色の画像（スクショなど）の境界線が分からない問題の対策
    outline: 1px solid oklch(80% 0 0);
  }

  .main-area-image-content_image {
    width: var(--width);
    max-width: 100%;
    min-width: 30px;
    aspect-ratio: var(--aspect-ratio);

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

    height: 55%;
    min-height: min(30px, 100%);

    width: 5%;
    min-width: 10px;
    max-width: 18px;

    visibility: hidden;

    .main-area-image-content_image-with-resize-handle:hover & {
      visibility: visible;
    }
  }

  .main-area-image-content_caption {
    width: var(--width);
    max-width: 100%;
    margin-bottom: common.toIntegerPx(0.2em);

    text-align: center;

    .completed &,
    .completed-children & {
      color: oklch(50% 0 0);
    }
  }
</style>
