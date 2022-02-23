<script lang="ts">
  import { ImageItemContentProps } from 'src/TreeifyTab/View/ItemContent/ImageItemContentProps'

  export let props: ImageItemContentProps
</script>

<div class="image-item-content_root" style:--width={props.width}>
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
  .image-item-content_image {
    width: var(--width);
    max-width: 100%;
    min-width: 30px;
    height: auto;
    aspect-ratio: var(--aspect-ratio);

    // Treeifyタブと同じ背景色の画像（スクショなど）の境界線が分からない問題の対策。
    border: 1px solid lch(80% 0 0);
  }

  .image-item-content_caption {
    width: var(--width);
    max-width: 100%;
    margin-bottom: 0.2em;

    text-align: center;

    // 完了状態のキャプション
    .completed &,
    .completed-children & {
      color: lch(50% 0 0);
    }
  }
</style>
