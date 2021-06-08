<script lang='ts'>
  import {ItemType} from '../../basicType'
  import ItemTreeCodeBlockContent from './ItemTreeCodeBlockContent.svelte'
  import {ItemTreeCodeBlockContentViewModel} from './ItemTreeCodeBlockContentView'
  import ItemTreeImageContent from './ItemTreeImageContent.svelte'
  import {ItemTreeImageContentViewModel} from './ItemTreeImageContentView'
  import ItemTreeTextContent from './ItemTreeTextContent.svelte'
  import {ItemTreeTextContentViewModel} from './ItemTreeTextContentView'
  import ItemTreeWebPageContent from './ItemTreeWebPageContent.svelte'
  import {ItemTreeWebPageContentViewModel} from './ItemTreeWebPageContentView'

  export type ItemTreeContentViewModel =
    | ItemTreeTextContentViewModel
    | ItemTreeWebPageContentViewModel
    | ItemTreeImageContentViewModel
    | ItemTreeCodeBlockContentViewModel

  export let viewModel: ItemTreeContentViewModel
</script>

{#if viewModel.itemType === ItemType.TEXT}
  <ItemTreeTextContent viewModel={viewModel}/>
{:else if viewModel.itemType === ItemType.WEB_PAGE}
  <ItemTreeWebPageContent viewModel={viewModel}/>
{:else if viewModel.itemType === ItemType.IMAGE}
  <ItemTreeImageContent viewModel={viewModel}/>
{:else if viewModel.itemType === ItemType.CODE_BLOCK}
  <ItemTreeCodeBlockContent viewModel={viewModel}/>
{/if}

<style>
</style>
