<script lang="ts">
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { MainAreaCodeBlockContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaCodeBlockContentProps'
  import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'

  export let props: MainAreaCodeBlockContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-code-block-content" {id} tabindex="0" on:focus={props.onFocus}>
  <ItemContent props={props.contentProps} />
</div>

<style global lang="scss">
  // コードブロック項目のコンテンツ領域のルート
  .main-area-code-block-content {
    // フォーカス時の枠線を非表示
    outline: none;
  }
</style>
