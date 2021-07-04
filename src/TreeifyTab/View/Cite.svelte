<script lang="ts">
  import {CiteProps} from './CiteProps'

  export let props: CiteProps
</script>

{#if props.title !== '' && props.url !== ''}
  <cite class="main-area-image-content_cite"
    ><a href={props.url} on:click={props.onClick}>{props.title}</a></cite
  >
{:else if props.title !== '' && props.url === ''}
  <cite class="main-area-image-content_cite">{props.title}</cite>
{:else if props.title === '' && props.url !== ''}
  <cite class="main-area-image-content_cite"
    ><a href={props.url} on:click={props.onClick}>{props.url}</a></cite
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
