<script context="module" lang="ts">
  import {ItemId, ItemType} from '../../basicType'
  import {Internal} from '../../Internal/Internal'
  import PageTreeTextContent, {createPageTreeTextContentProps} from './PageTreeTextContent.svelte'
  import PageTreeWebPageContent, {
    createPageTreeWebPageContentProps,
  } from './PageTreeWebPageContent.svelte'

  export function createPageTreeContentProps(itemId: ItemId) {
    const itemType = Internal.instance.state.items[itemId].itemType
    return {itemType, itemId}
  }
</script>

<script lang="ts">
  export let itemType: ItemType
  export let itemId: ItemId
</script>

{#if itemType === ItemType.TEXT}
  <PageTreeTextContent {...createPageTreeTextContentProps(itemId)} />
{:else if itemType === ItemType.WEB_PAGE}
  <PageTreeWebPageContent {...createPageTreeWebPageContentProps(itemId)} />
{/if}

<style>
</style>
