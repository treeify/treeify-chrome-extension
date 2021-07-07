<script lang="ts">
  import {getHighlightedHtml} from '../../highlightJs'
  import Cite from '../Cite.svelte'
  import {MainAreaCodeBlockContentProps} from './MainAreaCodeBlockContentProps'
  import {MainAreaContentView} from './MainAreaContentProps'
  
  export let props: MainAreaCodeBlockContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div
  class="main-area-code-block-content"
  {id}
  tabindex="0"
  on:focus={props.onFocus}
  on:mousedown={props.onClick}
>
  <pre><code>{@html getHighlightedHtml(props.code, props.language)}</code></pre>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style>
  :root {
    --code-block-padding: 0.2em;
  }

  /* コードブロックアイテムのコンテンツ領域のルート */
  .main-area-code-block-content {
    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;

    overflow-x: auto;
  }

  .main-area-code-block-content pre {
    border: 1px solid hsl(0, 0%, 80%);
    margin: 0;
    padding: var(--code-block-padding);
    /* これを指定しないとoverflowしたコードがborderからはみ出る */
    min-width: max-content;
    /* コードが空文字列のときにぺしゃんこにならないよう設定 */
    min-height: calc(var(--main-area-calculated-line-height) + 2 * var(--code-block-padding));

    font-size: 90%;
  }

  /* グレーアウト状態のコードブロックアイテム */
  :global(.grayed-out) .main-area-code-block-content {
    filter: opacity(50%);
  }
</style>
