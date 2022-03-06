<script lang="ts">
  import { getHighlightedHtml } from 'src/TreeifyTab/highlightJs'
  import { CodeBlockItemContentProps } from 'src/TreeifyTab/View/ItemContent/CodeBlocktemContentProps'

  export let props: CodeBlockItemContentProps
</script>

<div class="code-block-item-content_root {props.cssClasses.join(' ')}">
  {#if props.language !== ''}
    <pre class="code-block-item-content_code">{@html getHighlightedHtml(
        props.code.replace(/\r?\n$/, ''),
        props.language
      )}</pre>
  {:else}
    <pre class="code-block-item-content_code">{@html props.code.replace(/\r?\n$/, '')}</pre>
  {/if}
  {#if props.caption !== ''}
    <div class="code-block-item-content_caption">{props.caption}</div>
  {/if}
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .code-block-item-content_root {
    overflow-x: hidden;

    // 完了状態のコードブロック項目
    .completed &,
    .completed-children & {
      filter: opacity(50%);
    }

    &.doubtful {
      text-decoration: var(--doubtful-item-decoration);
      text-decoration-thickness: var(--doubtful-item-decoration-thickness);
      text-underline-offset: var(--doubtful-item-decoration-underline-offset);
    }
  }

  .code-block-item-content_code {
    border: 1px solid lch(80% 0 0);
    margin: 0;
    padding: common.em(0.2);
    // これを指定しないとoverflowしたコードがborderからはみ出る
    min-width: max-content;

    font-size: 90%;

    tab-size: 4;
  }

  .code-block-item-content_caption {
    margin-left: common.em(0.5);
    margin-top: common.em(0.1);
    margin-bottom: common.em(0.2);

    font-size: 80%;
    color: lch(30% 0 0);
  }
</style>
