<script lang="ts">
  import MainAreaCodeBlockContent from 'src/TreeifyTab/View/MainArea/MainAreaCodeBlockContent.svelte'
  import { MainAreaContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
  import MainAreaImageContent from 'src/TreeifyTab/View/MainArea/MainAreaImageContent.svelte'
  import MainAreaTexContent from 'src/TreeifyTab/View/MainArea/MainAreaTexContent.svelte'
  import MainAreaTextContent from 'src/TreeifyTab/View/MainArea/MainAreaTextContent.svelte'
  import MainAreaWebPageContent from 'src/TreeifyTab/View/MainArea/MainAreaWebPageContent.svelte'

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
