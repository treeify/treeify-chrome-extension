<script lang="ts">
  import { ImageItemContentProps } from 'src/TreeifyTab/View/ItemContent/ImageItemContentProps'

  export let props: ImageItemContentProps

  $: style = `
    --width: ${props.width};
    --aspect-ratio: ${props.aspectRatio};
  `
</script>

<img class="image-item-content" {style} src={props.url} />

<style global lang="scss">
  .image-item-content {
    width: var(--width);
    max-width: 100%;
    min-width: 30px;
    height: auto;
    aspect-ratio: var(--aspect-ratio);

    // Treeifyタブと同じ背景色の画像（スクショなど）の境界線が分からない問題の対策。
    // lch(90.0%, 0.0, 0.0)相当。
    border: 1px solid #e2e2e2;
  }
</style>
