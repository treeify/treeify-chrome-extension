<script lang="ts">
  import hljs from 'highlight.js'
  import {List} from 'immutable'
  import {ItemType} from '../../basicType'
  import {ItemPath} from '../../Internal/ItemPath'
  import Label from '../Label.svelte'
  import {ItemTreeContentView} from './ItemTreeContentView'

  export let itemPath: ItemPath
  export let labels: List<string>
  export let itemType: ItemType.CODE_BLOCK
  export let code: string
  export let language: string
  export let onFocus: (event: FocusEvent) => void
  export let onClick: (event: Event) => void

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

  const id = ItemTreeContentView.focusableDomElementId(itemPath)
</script>

<div class="item-tree-code-block-content" {id} tabindex="0" on:focus={onFocus} on:click={onClick}>
  {#if !labels.isEmpty()}
    <div class="item-tree-code-block-content_labels">
      {#each labels.toArray() as label}
        <Label text={label} />
      {/each}
    </div>
  {/if}
  <pre><code>{@html getHighlightedHtml(code, language)}</code></pre>
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
