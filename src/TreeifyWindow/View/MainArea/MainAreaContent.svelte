<script lang="ts">
  import {ItemType} from '../../basicType'
  import ItemTreeCodeBlockContent from './MainAreaCodeBlockContent.svelte'
  import {MainAreaContentProps} from './MainAreaContentProps'
  import ItemTreeImageContent from './MainAreaImageContent.svelte'
  import ItemTreeTexContent from './MainAreaTexContent.svelte'
  import ItemTreeTextContent from './MainAreaTextContent.svelte'
  import ItemTreeWebPageContent from './MainAreaWebPageContent.svelte'

  export let props: MainAreaContentProps
</script>

{#if props.itemType === ItemType.TEXT}
  <ItemTreeTextContent {props} />
{:else if props.itemType === ItemType.WEB_PAGE}
  <ItemTreeWebPageContent {props} />
{:else if props.itemType === ItemType.IMAGE}
  <ItemTreeImageContent {props} />
{:else if props.itemType === ItemType.CODE_BLOCK}
  <ItemTreeCodeBlockContent {props} />
{:else if props.itemType === ItemType.TEX}
  <ItemTreeTexContent {props} />
{/if}

<style>
</style>
