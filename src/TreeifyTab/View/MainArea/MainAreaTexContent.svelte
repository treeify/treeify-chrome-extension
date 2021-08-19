<script lang="ts">
  import TexItemContent from '../ItemContent/TexItemContent.svelte'
  import {MainAreaContentView} from './MainAreaContentProps'
  import {MainAreaTexContentProps} from './MainAreaTexContentProps'

  export let props: MainAreaTexContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-tex-content" {id} tabindex="0" on:focus={props.onFocus}>
  <TexItemContent props={props.contentProps} />
</div>

<style global lang="scss">
  // コードブロック項目のコンテンツ領域のルート
  .main-area-tex-content {
    // フォーカス時の枠線を非表示
    outline: none;
  }
</style>
