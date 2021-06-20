<script lang="ts">
  import hljs from 'highlight.js'
  import {CodeBlockItemContentProps} from './CodeBlocktemContentProps'

  export let props: CodeBlockItemContentProps

  function getHighlightedHtml(code: string, language: string): string {
    // ライブラリが対応していない言語の場合例外が投げられる
    try {
      const highlightResult = hljs.highlight(code, {
        ignoreIllegals: true,
        language,
      })
      return highlightResult.value
    } catch {
      return code
    }
  }
</script>

<div class="code-block-item-content">
  <pre><code>{@html getHighlightedHtml(props.code, props.language)}</code></pre>
</div>

<style>
  .code-block-item-content {
    overflow-x: auto;
  }

  .code-block-item-content pre {
    border: 1px solid hsl(0, 0%, 80%);
    margin: 0;
    padding: var(--code-block-padding);
    /* これを指定しないとoverflowしたコードがborderからはみ出る */
    min-width: max-content;

    font-size: 90%;
  }
</style>
