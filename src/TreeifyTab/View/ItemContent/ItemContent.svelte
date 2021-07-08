<script lang="ts">
  import {ItemType} from '../../basicType'
  import CodeBlockItemContent from './CodeBlockItemContent.svelte'
  import ImageItemContent from './ImageItemContent.svelte'
  import {ItemContentProps} from './ItemContentProps'
  import TexItemContent from './TexItemContent.svelte'
  import TextItemContent from './TextItemContent.svelte'
  import WebPageItemContent from './WebPageItemContent.svelte'

  export let props: ItemContentProps
</script>

{#if props.itemType === ItemType.TEXT}
  <TextItemContent {props} />
{:else if props.itemType === ItemType.WEB_PAGE}
  <WebPageItemContent {props} />
{:else if props.itemType === ItemType.IMAGE}
  <ImageItemContent {props} />
{:else if props.itemType === ItemType.CODE_BLOCK}
  <CodeBlockItemContent {props} />
{:else if props.itemType === ItemType.TEX}
  <TexItemContent {props} />
{/if}
