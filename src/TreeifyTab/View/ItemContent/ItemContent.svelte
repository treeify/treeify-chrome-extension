<script lang="ts">
  import CodeBlockItemContent from 'src/TreeifyTab/View/ItemContent/CodeBlockItemContent.svelte'
  import ImageItemContent from 'src/TreeifyTab/View/ItemContent/ImageItemContent.svelte'
  import { ItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
  import TexItemContent from 'src/TreeifyTab/View/ItemContent/TexItemContent.svelte'
  import TextItemContent from 'src/TreeifyTab/View/ItemContent/TextItemContent.svelte'
  import WebPageItemContent from 'src/TreeifyTab/View/ItemContent/WebPageItemContent.svelte'

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
