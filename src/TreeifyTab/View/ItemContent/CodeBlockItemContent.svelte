<script lang="ts">
  import { getHighlightedHtml } from 'src/TreeifyTab/highlightJs'
  import { CodeBlockItemContentProps } from 'src/TreeifyTab/View/ItemContent/CodeBlocktemContentProps'
  import Source from 'src/TreeifyTab/View/Source.svelte'

  export let props: CodeBlockItemContentProps
</script>

<div class="code-block-item-content">
  {#if props.language !== ''}
    <pre
      class="code-block-item-content_code">{@html getHighlightedHtml(props.code.replace(/\r?\n$/, ""), props.language)}</pre>
  {:else}
    <pre class="code-block-item-content_code">{@html props.code.replace(/\r?\n$/, '')}</pre>
  {/if}
  {#if props.caption !== ''}
    <div class="code-block-item-content_caption">{props.caption}</div>
  {/if}
  {#if props.sourceProps !== undefined}
    <Source props={props.sourceProps} />
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
    margin-top: 0.1em;
    margin-left: 0.5em;

    font-size: 78%;
    // lch(30.0%, 0.0, 0.0)相当
    color: #474747;
  }
</style>
