<script lang="ts">
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import SearchResultItem from './SearchResultItem.svelte'
  import { SearchResultPageProps } from './SearchResultPageProps'

  export let props: SearchResultPageProps
</script>

<div class="search-result-page">
  <div class="search-result-page_page">
    <div class="search-result-page_page-icon" />
    <ItemContent props={props.pageContent} />
  </div>
  <div class="search-result-page_tree">
    {#each props.searchResultItemPropses.toArray() as searchResultItemProps (searchResultItemProps.itemPath.toString())}
      <SearchResultItem props={searchResultItemProps} />
    {/each}
  </div>
</div>

<style global lang="scss">
  .search-result-page_page {
    display: flex;
    align-items: center;
  }

  .search-result-page_page-icon {
    width: 1.1em;
    aspect-ratio: 1;

    // lch(30.0%, 0.0, 0.0)相当
    background: #474747;
    -webkit-mask: url('page-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }

  .search-result-page_tree {
    // lch(70.0%, 0.0, 0.0)相当
    border: solid 1px #ababab;
    border-radius: 0.7em;
    padding: 0.5em 0.5em 0.5em 1em;
  }
</style>
