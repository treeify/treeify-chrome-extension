<script lang="ts">
  import {getHighlightedHtml} from '../../highlightJs'
  import {CodeBlockItemContentProps} from './CodeBlocktemContentProps'

  export let props: CodeBlockItemContentProps
</script>

<div class="code-block-item-content">
  <pre><code>{@html getHighlightedHtml(props.code, props.language)}</code></pre>
</div>

<style global lang="scss">
  .code-block-item-content {
    overflow-x: auto;
  }

  .code-block-item-content pre {
    /* lch(80.0%, 0.0, 0.0)相当 */
    border: 1px solid #c6c6c6;
    margin: 0;
    padding: var(--code-block-padding);
    /* これを指定しないとoverflowしたコードがborderからはみ出る */
    min-width: max-content;

    font-size: 90%;
  }
</style>
