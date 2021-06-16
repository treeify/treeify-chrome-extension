<script lang="ts">
  import {ItemType} from '../../basicType'
  import {PageTreeContentProps} from './PageTreeContentView'
  import PageTreeTextContent from './PageTreeTextContent.svelte'
  import PageTreeWebPageContent from './PageTreeWebPageContent.svelte'

  export let props: PageTreeContentProps
</script>

{#if props.itemType === ItemType.TEXT}
  <PageTreeTextContent {props} />
{:else if props.itemType === ItemType.WEB_PAGE}
  <PageTreeWebPageContent {props} />
{/if}

<style>
</style>
