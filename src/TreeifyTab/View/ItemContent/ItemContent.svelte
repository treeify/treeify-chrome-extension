<script lang="ts">
  import CodeBlockItemContent from './CodeBlockItemContent.svelte'
  import ImageItemContent from './ImageItemContent.svelte'
  import { ItemContentProps } from './ItemContentProps'
  import TexItemContent from './TexItemContent.svelte'
  import TextItemContent from './TextItemContent.svelte'
  import WebPageItemContent from './WebPageItemContent.svelte'

  export let props: ItemContentProps
</script>

{#if props.type === 'TextItemContentProps'}
  <TextItemContent {props} />
{:else if props.type === 'WebPageItemContentProps'}
  <WebPageItemContent {props} />
{:else if props.type === 'ImageItemContentProps'}
  <ImageItemContent {props} />
{:else if props.type === 'CodeBlockItemContentProps'}
  <CodeBlockItemContent {props} />
{:else if props.type === 'TexItemContentProps'}
  <TexItemContent {props} />
{/if}
