<script lang="ts">
  import { ImageItemContentProps } from 'src/TreeifyTab/View/ItemContent/ImageItemContentProps'

  export let props: ImageItemContentProps
</script>

<div class="image-item-content_root {props.cssClasses.join(' ')}" style:--width={props.width}>
  <img
    class="image-item-content_image"
    style:--aspect-ratio={props.aspectRatio}
    src={props.url}
    alt=""
  />
  {#if props.caption !== ''}
    <div class="image-item-content_caption">{props.caption}</div>
  {/if}
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .image-item-content_root {
    &.completed,
    .completed-children & {
      filter: opacity(50%);
    }

    &.doubtful {
      text-decoration: var(--doubtful-item-decoration);
      text-decoration-thickness: var(--doubtful-item-decoration-thickness);
      text-underline-offset: var(--doubtful-item-decoration-underline-offset);
    }
  }

  .image-item-content_image {
    width: var(--width);
    max-width: 100%;
    min-width: 30px;
    height: auto;
    aspect-ratio: var(--aspect-ratio);

    // Treeifyタブと同じ背景色の画像（スクショなど）の境界線が分からない問題の対策。
    border: 1px solid oklch(80% 0 0);
  }

  .image-item-content_caption {
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
