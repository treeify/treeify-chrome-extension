<script lang="ts">
  import {ItemType} from '../../basicType'
  import ItemTreeCodeBlockContent from './ItemTreeCodeBlockContent.svelte'
  import {ItemTreeCodeBlockContentViewModel} from './ItemTreeCodeBlockContentView'
  import ItemTreeImageContent from './ItemTreeImageContent.svelte'
  import {ItemTreeImageContentViewModel} from './ItemTreeImageContentView'
  import ItemTreeTextContent from './ItemTreeTextContent.svelte'
  import {ItemTreeTextContentViewModel} from './ItemTreeTextContentView'
  import ItemTreeWebPageContent from './ItemTreeWebPageContent.svelte'
  import {ItemTreeWebPageContentViewModel} from './ItemTreeWebPageContentView'

  type ItemTreeContentViewModel =
    | ItemTreeTextContentViewModel
    | ItemTreeWebPageContentViewModel
    | ItemTreeImageContentViewModel
    | ItemTreeCodeBlockContentViewModel

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
