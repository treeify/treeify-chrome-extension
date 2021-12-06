<script lang="ts">
  import katex from 'katex'
  import { TexItemContentProps } from 'src/TreeifyTab/View/ItemContent/TexItemContentProps'
  import Source from 'src/TreeifyTab/View/Source.svelte'

  export let props: TexItemContentProps
</script>

<div class="tex-item-content_root">
  <div class="tex-item-content_rendered-tex">
    {@html katex.renderToString(props.code, { throwOnError: false })}
  </div>
  {#if props.caption !== ''}
    <div class="tex-item-content_caption">{props.caption}</div>
  {/if}
  {#if props.sourceProps !== undefined}
    <Source props={props.sourceProps} />
  {/if}
</div>

<style global lang="scss">
  .completed .tex-item-content_root,
  .completed-children .tex-item-content_root {
    filter: opacity(50%);
  }

  .tex-item-content_caption {
    margin-top: 0.1em;
    margin-left: 0.5em;

    font-size: 78%;
    // lch(30.0%, 0.0, 0.0)相当
    color: #474747;
  }
</style>
