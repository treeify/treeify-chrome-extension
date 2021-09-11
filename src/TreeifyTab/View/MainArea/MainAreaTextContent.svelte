<script lang="ts">
  import {DomishObject} from '../../Internal/DomishObject'
  import Cite from '../Cite.svelte'
  import {MainAreaContentView} from './MainAreaContentProps'
  import {MainAreaTextContentProps} from './MainAreaTextContentProps'

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
  .citation .main-area-text-content {
    // lch(80.0%, 0.0, 0.0)相当
    border-left: 0.25em solid #c6c6c6;
    padding-left: 0.2em;
  }

  // テキスト項目のcontenteditableな要素
  .main-area-text-content_content-editable {
    // contenteditableな要素のフォーカス時の枠線を非表示
    outline: none;

    // グレーアウト状態のテキスト項目
    .grayed-out &,
    .grayed-out-children & {
      color: var(--grayed-out-item-text-color);
    }
  }
</style>
