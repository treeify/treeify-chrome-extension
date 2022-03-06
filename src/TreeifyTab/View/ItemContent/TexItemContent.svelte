<script lang="ts">
  import katex from 'katex'
  import { TexItemContentProps } from 'src/TreeifyTab/View/ItemContent/TexItemContentProps'

  export let props: TexItemContentProps
</script>

<div class="tex-item-content_root {props.cssClasses.join(' ')}">
  <div class="tex-item-content_rendered-tex">
    {@html katex.renderToString(props.code, { throwOnError: false })}
  </div>
  {#if props.caption !== ''}
    <div class="tex-item-content_caption">{props.caption}</div>
  {/if}
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .tex-item-content_root {
    overflow: hidden;

    padding-block: common.toIntegerPx(0.3em);
    // 左端が切れてしまうことがある不具合の対策（原因は小数点pxを使っていることか、KaTeXの表示領域サイズの扱いが特殊だからか）
    padding-inline: common.toIntegerPx(0.1em);

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

  .tex-item-content_caption {
    margin-left: common.toIntegerPx(0.5em);
    margin-top: common.toIntegerPx(0.1em);

    font-size: 80%;
    color: oklch(30% 0 0);
  }
</style>
