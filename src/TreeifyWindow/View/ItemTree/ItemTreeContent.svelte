<script context="module" lang="ts">
  import {ItemType} from '../../basicType'
  import {Internal} from '../../Internal/Internal'
  import {ItemPath} from '../../Internal/ItemPath'
  import ItemTreeCodeBlockContent, {
    createItemTreeCodeBlockContentProps,
  } from './ItemTreeCodeBlockContent.svelte'
  import ItemTreeImageContent, {
    createItemTreeImageContentProps,
  } from './ItemTreeImageContent.svelte'
  import ItemTreeTextContent, {createItemTreeTextContentProps} from './ItemTreeTextContent.svelte'
  import ItemTreeWebPageContent, {
    createItemTreeWebPageContentProps,
  } from './ItemTreeWebPageContent.svelte'

  export function createItemTreeContentProps(itemPath: ItemPath) {
    return {
      itemType: Internal.instance.state.items[ItemPath.getItemId(itemPath)].itemType,
      itemPath,
    }
  }
</script>

<script lang="ts">
  export let itemType: ItemType
  export let itemPath: ItemPath
</script>

{#if itemType === ItemType.TEXT}
  <ItemTreeTextContent {...createItemTreeTextContentProps(itemPath)} />
{:else if itemType === ItemType.WEB_PAGE}
  <ItemTreeWebPageContent {...createItemTreeWebPageContentProps(itemPath)} />
{:else if itemType === ItemType.IMAGE}
  <ItemTreeImageContent {...createItemTreeImageContentProps(itemPath)} />
{:else if itemType === ItemType.CODE_BLOCK}
  <ItemTreeCodeBlockContent {...createItemTreeCodeBlockContentProps(itemPath)} />
{/if}

<style>
</style>
