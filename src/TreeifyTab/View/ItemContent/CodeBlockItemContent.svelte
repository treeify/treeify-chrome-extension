<script lang="ts">
  import { getHighlightedHtml } from 'src/TreeifyTab/highlightJs'
  import Cite from 'src/TreeifyTab/View/Cite.svelte'
  import { CodeBlockItemContentProps } from 'src/TreeifyTab/View/ItemContent/CodeBlocktemContentProps'

  export let props: CodeBlockItemContentProps
</script>

<div class="code-block-item-content">
  <pre
    class="code-block-item-content_code">{@html getHighlightedHtml(props.code, props.language)}</pre>
  <div class="code-block-item-content_caption">{props.caption}</div>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style global lang="scss">
  .code-block-item-content {
    overflow-x: auto;

    // 完了状態のコードブロック項目
    .completed &,
    .completed-children & {
      filter: opacity(50%);
    }
  }

  .code-block-item-content_code {
    // lch(80.0%, 0.0, 0.0)相当
    border: 1px solid #c6c6c6;
    margin: 0;
    padding: 0.2em;
    // これを指定しないとoverflowしたコードがborderからはみ出る
    min-width: max-content;

    font-size: 90%;
  }

  .code-block-item-content_caption {
    margin-top: 0.2em;
    margin-left: 0.2em;

    font-size: 85%;
    // lch(50.0%, 0.0, 0.0)相当
    color: #777777;
  }
</style>
