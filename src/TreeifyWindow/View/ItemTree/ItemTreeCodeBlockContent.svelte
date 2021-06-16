<script lang="ts">
  import hljs from 'highlight.js'
  import Label from '../Label.svelte'
  import {ItemTreeCodeBlockContentViewModel} from './ItemTreeCodeBlockContentView'
  import {ItemTreeContentView} from './ItemTreeContentView'

  export let viewModel: ItemTreeCodeBlockContentViewModel

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

  const id = ItemTreeContentView.focusableDomElementId(viewModel.itemPath)
</script>

<div
  class="item-tree-code-block-content"
  {id}
  tabindex="0"
  on:focus={viewModel.onFocus}
  on:click={viewModel.onClick}
>
  {#if !viewModel.labels.isEmpty()}
    <div class="item-tree-code-block-content_labels">
      {#each viewModel.labels.toArray() as label}
        <Label viewModel={{text: label}} />
      {/each}
    </div>
  {/if}
  <pre><code>{@html getHighlightedHtml(viewModel.code, viewModel.language)}</code></pre>
</div>

<style>
  :root {
    --code-block-padding: 0.2em;
  }

  /* コードブロックアイテムのコンテンツ領域のルート */
  .item-tree-code-block-content {
    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;

    overflow-x: auto;
  }

  .item-tree-code-block-content pre {
    border: 1px solid hsl(0, 0%, 80%);
    margin: 0;
    padding: var(--code-block-padding);
    /* これを指定しないとoverflowしたコードがborderからはみ出る */
    min-width: max-content;
    /* コードが空文字列のときにぺしゃんこにならないよう設定 */
    min-height: calc(var(--item-tree-calculated-line-height) + 2 * var(--code-block-padding));

    font-size: 90%;
  }

  /* グレーアウト状態のコードブロックアイテム */
  :global(.grayed-out) .item-tree-code-block-content {
    filter: opacity(50%);
  }
</style>
