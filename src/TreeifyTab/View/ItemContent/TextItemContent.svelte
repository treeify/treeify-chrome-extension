<script lang="ts">
  import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
  import { TextItemContentProps } from 'src/TreeifyTab/View/ItemContent/TextItemContentProps'

  export let props: TextItemContentProps

  const nbsp = String.fromCharCode(160)
</script>

<div class="text-item-content_root" class:has-source={props.hasSource}>
  <!-- 空のテキスト項目でのレイアウト崩れを防ぐためにnbspを入れる -->
  {@html DomishObject.toHtml(props.domishObjects) || nbsp}
</div>

<style global lang="scss">
  .text-item-content_root {
    overflow-x: hidden;

    &.has-source {
      border-left: 0.25em solid lch(80% 0 0);
      padding-left: 0.2em;
    }
  }
</style>
