<script lang="ts">
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { MainAreaCodeBlockContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaCodeBlockContentProps'
  import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
  import Source from 'src/TreeifyTab/View/Source.svelte'

  export let props: MainAreaCodeBlockContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-code-block-content_root" {id} tabindex="0" on:focus={props.onFocus}>
  <ItemContent props={props.contentProps} />
  {#if props.sourceProps !== undefined}
    <Source props={props.sourceProps} />
  {/if}
</div>

<style global lang="scss">
  // コードブロック項目のコンテンツ領域のルート
  .main-area-code-block-content_root {
    // フォーカス時の枠線を非表示
    outline: none;
  }
</style>
