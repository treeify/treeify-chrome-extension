<script lang="ts">
  import {ItemType} from '../../basicType'
  import ItemTreeCodeBlockContent from './ItemTreeCodeBlockContent.svelte'
  import {ItemTreeContentProps} from './ItemTreeContentView'
  import ItemTreeImageContent from './ItemTreeImageContent.svelte'
  import ItemTreeTextContent from './ItemTreeTextContent.svelte'
  import ItemTreeWebPageContent from './ItemTreeWebPageContent.svelte'

  export let props: ItemTreeContentProps
</script>

{#if props.itemType === ItemType.TEXT}
  <ItemTreeTextContent {props} />
{:else if props.itemType === ItemType.WEB_PAGE}
  <ItemTreeWebPageContent {props} />
{:else if props.itemType === ItemType.IMAGE}
  <ItemTreeImageContent {props} />
{:else if props.itemType === ItemType.CODE_BLOCK}
  <ItemTreeCodeBlockContent {props} />
{/if}

<style>
</style>
