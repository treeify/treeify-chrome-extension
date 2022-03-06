<script lang="ts">
  import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
  import { TextItemContentProps } from 'src/TreeifyTab/View/ItemContent/TextItemContentProps'

  export let props: TextItemContentProps

  const nbsp = String.fromCharCode(160)
</script>

<div class="text-item-content_root {props.cssClasses.join(' ')}" class:has-source={props.hasSource}>
  <!-- 空のテキスト項目でのレイアウト崩れを防ぐためにnbspを入れる -->
  {@html DomishObject.toHtml(props.domishObjects) || nbsp}
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .text-item-content_root {
    overflow-x: hidden;

    &.has-source {
      border-left: common.em(0.25) solid lch(80% 0 0);
      padding-left: common.em(0.2);
    }

    &.doubtful {
      text-decoration: var(--doubtful-item-decoration);
      text-decoration-thickness: var(--doubtful-item-decoration-thickness);
      text-underline-offset: var(--doubtful-item-decoration-underline-offset);
    }
  }
</style>
