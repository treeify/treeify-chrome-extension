<script lang="ts">
  import {ImageItemContentProps} from './ImageItemContentProps'

  export let props: ImageItemContentProps
</script>

<img class="image-item-content" src={props.url} />

<style>
  .image-item-content {
    /* 画像が表示領域の横幅をはみ出さないよう設定 */
    max-width: 100%;
    height: auto;

    /* Treeifyタブと同じ背景色の画像（スクショなど）の境界線が分からない問題の対策 */
    border: 1px solid hsl(0, 0%, 90%);
  }
</style>
