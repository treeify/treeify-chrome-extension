<script lang="ts">
  import {CiteProps} from './CiteProps'

  export let props: CiteProps
</script>

{#if props.title !== '' && props.url !== ''}
  <cite class="main-area-image-content_cite"
    ><a href={props.url} target="_blank" rel="noopener noreferrer" on:mousedown={props.onMouseDown}
      >{props.title}</a
    ></cite
  >
{:else if props.title !== '' && props.url === ''}
  <cite class="main-area-image-content_cite">{props.title}</cite>
{:else if props.title === '' && props.url !== ''}
  <cite class="main-area-image-content_cite"
    ><a href={props.url} target="_blank" rel="noopener noreferrer" on:mousedown={props.onMouseDown}
      >{props.url}</a
    ></cite
  >
{/if}

<style global lang="scss">
  .main-area-image-content_cite {
    font-size: 50%;
    /* lch(60.0%, 0.0, 0.0)相当 */
    color: #919191;

    /* 右寄せ */
    margin-left: auto;
    display: block;
    width: max-content;

    /* テキストが長すぎる場合への対策 */
    max-width: 80%;
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    a {
      color: inherit;
    }
  }
</style>
