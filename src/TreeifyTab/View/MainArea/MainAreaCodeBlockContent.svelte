<script lang="ts">
  import CodeBlockItemContent from '../ItemContent/CodeBlockItemContent.svelte'
  import {MainAreaCodeBlockContentProps} from './MainAreaCodeBlockContentProps'
  import {MainAreaContentView} from './MainAreaContentProps'

  export let props: MainAreaCodeBlockContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-code-block-content" {id} tabindex="0" on:focus={props.onFocus}>
  <CodeBlockItemContent props={props.contentProps} />
</div>

<style global lang="scss">
  // コードブロック項目のコンテンツ領域のルート
  .main-area-code-block-content {
    // フォーカス時の枠線を非表示
    outline: 0 solid transparent;
  }
</style>
