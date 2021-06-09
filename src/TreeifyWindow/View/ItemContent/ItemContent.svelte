<script context="module" lang="ts">
  import {ItemId} from '../../basicType'
  import {Internal} from '../../Internal/Internal'

  export function createItemContentProps(itemId: ItemId) {
    return {
      itemId,
      itemType: Internal.instance.state.items[itemId].itemType,
    }
  }
</script>

<script lang="ts">
  import {ItemType} from '../../basicType'
  import TextItemContent, {createTextItemContentProps} from './TextItemContent.svelte'

  export let itemType: ItemType
  export let itemId: ItemId
</script>

{#if itemType === ItemType.TEXT}
  <TextItemContent {...createTextItemContentProps(itemId)} />
{:else if itemType === ItemType.WEB_PAGE}
  <!-- TODO: 未実装 -->
{:else if itemType === ItemType.IMAGE}
  <!-- TODO: 未実装 -->
{:else if itemType === ItemType.CODE_BLOCK}
  <!-- TODO: 未実装 -->
{/if}

<style>
</style>
