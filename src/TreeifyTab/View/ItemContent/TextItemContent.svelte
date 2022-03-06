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
      border-left: common.toIntegerPx(0.25em) solid oklch(80% 0 0);
      padding-left: common.toIntegerPx(0.2em);
    }

    &.doubtful {
      text-decoration: var(--doubtful-item-decoration);
      text-decoration-thickness: var(--doubtful-item-decoration-thickness);
      text-underline-offset: var(--doubtful-item-decoration-underline-offset);
    }

    &.completed {
      color: var(--completed-item-text-color);
    }
  }
</style>
