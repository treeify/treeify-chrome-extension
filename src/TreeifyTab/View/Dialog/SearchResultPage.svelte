<script lang="ts">
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import SearchResultItem from './SearchResultItem.svelte'
  import {SearchResultPageProps} from './SearchResultPageProps'

  export let props: SearchResultPageProps
</script>

<div class="search-result-page">
  <ItemContent props={props.pageContent} />
  <div class="search-result-page_tree">
    {#each props.searchResultItemPropses.toArray() as searchResultItemProps (searchResultItemProps.itemPath.toString())}
      <SearchResultItem props={searchResultItemProps} />
    {/each}
  </div>
</div>

<style>
  .search-result-page_tree {
    /* lch(70.0%, 0.0, 0.0)相当 */
    border: solid 1px #ababab;
    border-radius: 0.7em;
    padding: 0.5em 0.5em 0.5em 1em;
  }
</style>
