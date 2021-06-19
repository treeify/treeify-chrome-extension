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
  }
</style>
