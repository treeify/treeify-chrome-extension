<script lang="ts">
  import {ItemType} from '../../basicType'
  import {PageTreeContentViewModel} from './PageTreeContentView'
  import PageTreeTextContent from './PageTreeTextContent.svelte'
  import PageTreeWebPageContent from './PageTreeWebPageContent.svelte'

  export let viewModel: PageTreeContentViewModel
</script>

{#if viewModel.itemType === ItemType.TEXT}
  <PageTreeTextContent {viewModel} />
{:else if viewModel.itemType === ItemType.WEB_PAGE}
  <PageTreeWebPageContent {viewModel} />
{/if}

<style>
</style>
