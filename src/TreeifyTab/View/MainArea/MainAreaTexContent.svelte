<script lang="ts">
  import katex from 'katex'
  import Cite from '../Cite.svelte'
  import {MainAreaContentView} from './MainAreaContentProps'
  import {MainAreaTexContentProps} from './MainAreaTexContentProps'

  export let props: MainAreaTexContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-tex-content" {id} tabindex="0" on:focus={props.onFocus}>
  <div class="main-area-tex-content_rendered-tex">
    {@html katex.renderToString(props.code, {throwOnError: false})}
  </div>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style global lang="scss">
  // コードブロック項目のコンテンツ領域のルート
  .main-area-tex-content {
    // フォーカス時の枠線を非表示
    outline: 0 solid transparent;

    min-height: var(--main-area-calculated-line-height);
  }

  // グレーアウト状態のコードブロック項目
  .grayed-out .main-area-tex-content {
    filter: opacity(50%);
  }
</style>
