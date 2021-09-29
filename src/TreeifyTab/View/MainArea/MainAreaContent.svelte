<script lang="ts">
  import {ItemType} from '../../basicType'
  import MainAreaCodeBlockContent from './MainAreaCodeBlockContent.svelte'
  import {MainAreaContentProps} from './MainAreaContentProps'
  import MainAreaImageContent from './MainAreaImageContent.svelte'
  import MainAreaTexContent from './MainAreaTexContent.svelte'
  import MainAreaTextContent from './MainAreaTextContent.svelte'
  import MainAreaWebPageContent from './MainAreaWebPageContent.svelte'

  export let props: MainAreaContentProps
</script>

{#if props.type === ItemType.TEXT}
  <MainAreaTextContent {props} />
{:else if props.type === ItemType.WEB_PAGE}
  <MainAreaWebPageContent {props} />
{:else if props.type === ItemType.IMAGE}
  <MainAreaImageContent {props} />
{:else if props.type === ItemType.CODE_BLOCK}
  <MainAreaCodeBlockContent {props} />
{:else if props.type === ItemType.TEX}
  <MainAreaTexContent {props} />
{/if}

<style global lang="scss">
</style>
