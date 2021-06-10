<script lang="ts">
  import {ItemType} from '../../basicType'
  import PageTreeTextContent from './PageTreeTextContent.svelte'
  import {PageTreeTextContentViewModel} from './PageTreeTextContentView'
  import PageTreeWebPageContent from './PageTreeWebPageContent.svelte'
  import {PageTreeWebPageContentViewModel} from './PageTreeWebPageContentView'

  type PageTreeContentViewModel = PageTreeTextContentViewModel | PageTreeWebPageContentViewModel

  export let viewModel: PageTreeContentViewModel
</script>

{#if viewModel.itemType === ItemType.TEXT}
  <PageTreeTextContent {...viewModel} />
{:else if viewModel.itemType === ItemType.WEB_PAGE}
  <PageTreeWebPageContent {...viewModel} />
{/if}

<style>
</style>
