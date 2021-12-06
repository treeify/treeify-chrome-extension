<script lang="ts">
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
  import { MainAreaTexContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaTexContentProps'

  export let props: MainAreaTexContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-tex-content_root" {id} tabindex="0" on:focus={props.onFocus}>
  <ItemContent props={props.contentProps} />
</div>

<style global lang="scss">
  // コードブロック項目のコンテンツ領域のルート
  .main-area-tex-content_root {
    // フォーカス時の枠線を非表示
    outline: none;
  }
</style>
