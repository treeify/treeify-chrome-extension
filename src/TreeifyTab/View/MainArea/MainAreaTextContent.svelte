<script lang="ts">
  import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
  import Cite from 'src/TreeifyTab/View/Cite.svelte'
  import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
  import { MainAreaTextContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaTextContentProps'

  export let props: MainAreaTextContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-text-content">
  <div
    class="main-area-text-content_content-editable"
    {id}
    contenteditable="true"
    on:input={props.onInput}
    on:compositionend={props.onCompositionEnd}
  >
    {@html DomishObject.toHtml(props.domishObjects)}
  </div>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style global lang="scss">
  // テキスト項目のcontenteditableな要素
  .main-area-text-content_content-editable {
    // contenteditableな要素のフォーカス時の枠線を非表示
    outline: none;

    .citation & {
      // lch(80.0%, 0.0, 0.0)相当
      border-left: 0.25em solid #c6c6c6;
      padding-left: 0.2em;
    }

    // 完了状態のテキスト項目
    .completed &,
    .completed-children & {
      color: var(--completed-item-text-color);
    }
  }
</style>
