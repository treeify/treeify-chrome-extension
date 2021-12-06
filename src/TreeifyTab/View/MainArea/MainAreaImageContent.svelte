<script lang="ts">
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { SizePx } from 'src/TreeifyTab/Internal/State'
  import { dragImageBottom } from 'src/TreeifyTab/View/dragAndDrop'
  import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
  import { MainAreaImageContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaImageContentProps'
  import ResizeHandle from 'src/TreeifyTab/View/MainArea/ResizeHandle.svelte'
  import Source from 'src/TreeifyTab/View/Source.svelte'

  export let props: MainAreaImageContentProps
  $: originalSize = props.originalSize ?? undefined

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
  $: style = deriveStyle(originalSize)

  function deriveStyle(originalSize: SizePx | undefined): string {
    if (props.widthPx !== null) {
      if (originalSize !== undefined) {
        return `
          --width: ${props.widthPx}px;
          --aspect-ratio: ${originalSize.widthPx / originalSize.heightPx};
        `
      } else {
        return `
          --width: ${props.widthPx}px;
          --aspect-ratio: auto;
        `
      }
    } else {
      if (originalSize !== undefined) {
        return `
          --width: ${originalSize.widthPx}px;
          --aspect-ratio: ${originalSize.widthPx / originalSize.heightPx};
        `
      } else {
        return `
          --width: auto;
          --aspect-ratio: auto;
        `
      }
    }
  }

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

<div class="main-area-image-content_root" {id} {style} tabindex="0" on:focus={props.onFocus}>
  <div class="main-area-image-content_image-with-resize-handle">
    <img class="main-area-image-content_image" src={props.url} draggable="false" on:load={onLoad} />
    <div
      class="main-area-image-content_resize-handle"
      use:dragImageBottom={ItemPath.getItemId(props.itemPath)}
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
  .main-area-image-content_root {
    outline: none;

    max-width: 100%;
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
    width: var(--width);
    max-width: 100%;
    min-width: 30px;
    aspect-ratio: var(--aspect-ratio);

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
    width: var(--width);
    max-width: 100%;

    text-align: center;

    // 完了状態のキャプション
    .completed &,
    .completed-children & {
      // lch(50.0%, 0.0, 0.0)相当
      color: #777777;
    }
  }
</style>
