<script lang="ts">
  import MainAreaCodeBlockContent from './MainAreaCodeBlockContent.svelte'
  import { MainAreaContentProps } from './MainAreaContentProps'
  import MainAreaImageContent from './MainAreaImageContent.svelte'
  import MainAreaTexContent from './MainAreaTexContent.svelte'
  import MainAreaTextContent from './MainAreaTextContent.svelte'
  import MainAreaWebPageContent from './MainAreaWebPageContent.svelte'

  export let props: MainAreaContentProps
</script>

{#if props.type === 'MainAreaTextContentProps'}
  <MainAreaTextContent {props} />
{:else if props.type === 'MainAreaWebPageContentProps'}
  <MainAreaWebPageContent {props} />
{:else if props.type === 'MainAreaImageContentProps'}
  <MainAreaImageContent {props} />
{:else if props.type === 'MainAreaCodeBlockContentProps'}
  <MainAreaCodeBlockContent {props} />
{:else if props.type === 'MainAreaTexContentProps'}
  <MainAreaTexContent {props} />
{/if}

<style global lang="scss">
</style>
