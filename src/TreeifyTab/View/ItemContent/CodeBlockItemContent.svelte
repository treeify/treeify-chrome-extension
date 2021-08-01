<script lang="ts">
  import {getHighlightedHtml} from '../../highlightJs'
  import {CodeBlockItemContentProps} from './CodeBlocktemContentProps'

  export let props: CodeBlockItemContentProps
</script>

<div class="code-block-item-content">
  <pre
    class="code-block-item-content_code">{@html getHighlightedHtml(props.code, props.language)}</pre>
</div>

<style global lang="scss">
  .code-block-item-content {
    overflow-x: auto;
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
</style>
