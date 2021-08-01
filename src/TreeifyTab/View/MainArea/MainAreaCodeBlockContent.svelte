<script lang="ts">
  import {getHighlightedHtml} from '../../highlightJs'
  import Cite from '../Cite.svelte'
  import {MainAreaCodeBlockContentProps} from './MainAreaCodeBlockContentProps'
  import {MainAreaContentView} from './MainAreaContentProps'

  export let props: MainAreaCodeBlockContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-code-block-content" {id} tabindex="0" on:focus={props.onFocus}>
  <pre
    class="main-area-code-block-content_code">{@html getHighlightedHtml(props.code, props.language)}</pre>
  <div class="main-area-code-block-content_caption">{props.caption}</div>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style global lang="scss">
  :root {
    --code-block-padding: 0.2em;
  }

  // コードブロック項目のコンテンツ領域のルート
  .main-area-code-block-content {
    // フォーカス時の枠線を非表示
    outline: 0 solid transparent;

    overflow-x: auto;

    // グレーアウト状態のコードブロック項目
    .grayed-out & {
      filter: opacity(50%);
    }
  }

  .main-area-code-block-content_code {
    // lch(80.0%, 0.0, 0.0)相当
    border: 1px solid #c6c6c6;
    margin: 0;
    padding: var(--code-block-padding);
    // これを指定しないとoverflowしたコードがborderからはみ出る
    min-width: max-content;
    // コードが空文字列のときにぺしゃんこにならないよう設定
    min-height: calc(var(--main-area-calculated-line-height) + 2 * var(--code-block-padding));

    font-size: 90%;
  }

  .main-area-code-block-content_caption {
    font-size: 85%;
    // lch(50.0%, 0.0, 0.0)相当
    color: #777777;
  }
</style>
