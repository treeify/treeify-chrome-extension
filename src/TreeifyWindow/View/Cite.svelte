<script lang="ts">
  import {CiteProps} from './CiteProps'

  export let props: CiteProps
</script>

{#if props.cite !== '' && props.citeUrl !== ''}
  <cite class="main-area-image-content_cite"
    ><a href={props.citeUrl} on:click={props.onClick}>{props.cite}</a></cite
  >
{:else if props.cite !== '' && props.citeUrl === ''}
  <cite class="main-area-image-content_cite">{props.cite}</cite>
{:else if props.cite === '' && props.citeUrl !== ''}
  <cite class="main-area-image-content_cite"
    ><a href={props.citeUrl} on:click={props.onClick}>{props.citeUrl}</a></cite
  >
{/if}

<style>
  .main-area-image-content_cite {
    font-size: 50%;
    color: hsl(0, 0%, 60%);

    /* 右寄せ */
    margin-left: auto;
    display: block;
    width: max-content;
    
    /* テキストが長すぎる場合への対策 */
    max-width: 80%;
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .main-area-image-content_cite a {
    color: inherit;
  }
</style>
