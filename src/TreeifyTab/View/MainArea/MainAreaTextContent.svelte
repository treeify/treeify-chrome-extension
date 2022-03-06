<script lang="ts">
  import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
  import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
  import { MainAreaTextContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaTextContentProps'
  import Source from 'src/TreeifyTab/View/Source.svelte'

  export let props: MainAreaTextContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-text-content_root">
  <div
    class="main-area-text-content_content-editable"
    {id}
    contenteditable="true"
    on:input={props.onInput}
    on:compositionend={props.onCompositionEnd}
  >
    {@html DomishObject.toHtml(props.domishObjects)}
  </div>
  {#if props.sourceProps !== undefined}
    <Source props={props.sourceProps} />
  {/if}
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  // テキスト項目のcontenteditableな要素
  .main-area-text-content_content-editable {
    // contenteditableな要素のフォーカス時の枠線を非表示
    outline: none;

    padding-block: var(--main-area-node-content-area-vertical-padding);

    .has-source & {
      border-left: common.toIntegerPx(0.25em) solid oklch(80% 0 0);
      padding-left: common.toIntegerPx(0.2em);
    }

    .completed &,
    .completed-children & {
      color: var(--completed-item-text-color);
    }
  }
</style>
