<script lang="ts">
  import { SourceProps } from 'src/TreeifyTab/View/SourceProps'

  export let props: SourceProps
</script>

{#if props.title !== '' && props.url !== ''}
  <cite class="source_root">
    <a
      class="source_link"
      href={props.url}
      target="_blank"
      rel="noopener noreferrer"
      on:mousedown={props.onMouseDown}
    >
      {props.title}
    </a>
  </cite>
{:else if props.title !== '' && props.url === ''}
  <cite class="source_root">{props.title}</cite>
{:else if props.title === '' && props.url !== ''}
  <cite class="source_root">
    <a
      class="source_link"
      href={props.url}
      target="_blank"
      rel="noopener noreferrer"
      on:mousedown={props.onMouseDown}
    >
      {props.url}
    </a>
  </cite>
{/if}

<style global lang="scss">
  .source_root {
    font-size: 50%;
    // lch(60.0%, 0.0, 0.0)相当
    color: #919191;

    // 右寄せ
    margin-left: auto;
    display: block;
    width: max-content;

    // テキストが長すぎる場合への対策
    max-width: 80%;
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    a {
      color: inherit;
    }
  }
</style>
