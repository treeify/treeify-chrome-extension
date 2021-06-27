<script lang="ts">
  import {CiteProps} from './CiteProps'

  export let props: CiteProps
</script>

{#if props.cite !== '' && props.citeUrl !== ''}
  <cite class="item-tree-image-content_cite"
    ><a href={props.citeUrl} on:click={props.onClick}>{props.cite}</a></cite
  >
{:else if props.cite !== '' && props.citeUrl === ''}
  <cite class="item-tree-image-content_cite">{props.cite}</cite>
{:else if props.cite === '' && props.citeUrl !== ''}
  <cite class="item-tree-image-content_cite"
    ><a href={props.citeUrl} on:click={props.onClick}>{props.citeUrl}</a></cite
  >
{/if}

<style>
  .item-tree-image-content_cite {
    font-size: 50%;
    color: hsl(0, 0%, 60%);

    /* 右寄せ */
    margin-left: auto;
    display: block;
    width: max-content;
  }
  .item-tree-image-content_cite a {
    color: inherit;
  }
</style>
