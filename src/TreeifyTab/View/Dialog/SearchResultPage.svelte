<script lang="ts">
  import SearchResultItem from './SearchResultItem.svelte'
  import {SearchResultPageProps} from './SearchResultPageProps'

  export let props: SearchResultPageProps
</script>

<div class="search-result-page">
  {#each props.searchResultItemPropses.toArray() as searchResultItemProps (searchResultItemProps.itemPath.toString())}
    <SearchResultItem props={searchResultItemProps} />
  {/each}
</div>

<style>
  .search-result-page {
    border: solid 1px hsl(0, 0%, 70%);
    border-radius: 0.7em;
    padding: 0.5em 0.5em 0.5em 1em;
  }
</style>
