<script lang="ts">
  import {ItemType} from '../../basicType'
  import ItemTreeCodeBlockContent from './ItemTreeCodeBlockContent.svelte'
  import {ItemTreeContentViewModel} from './ItemTreeContentView'
  import ItemTreeImageContent from './ItemTreeImageContent.svelte'
  import ItemTreeTextContent from './ItemTreeTextContent.svelte'
  import ItemTreeWebPageContent from './ItemTreeWebPageContent.svelte'

  export let viewModel: ItemTreeContentViewModel
</script>

{#if viewModel.itemType === ItemType.TEXT}
  <ItemTreeTextContent {viewModel} />
{:else if viewModel.itemType === ItemType.WEB_PAGE}
  <ItemTreeWebPageContent {viewModel} />
{:else if viewModel.itemType === ItemType.IMAGE}
  <ItemTreeImageContent {viewModel} />
{:else if viewModel.itemType === ItemType.CODE_BLOCK}
  <ItemTreeCodeBlockContent {viewModel} />
{/if}

<style>
</style>
