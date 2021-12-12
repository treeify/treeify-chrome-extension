<script lang="ts">
  import SearchResultItem from 'src/TreeifyTab/View/Dialog/SearchResultItem.svelte'
  import { SearchResultPageProps } from 'src/TreeifyTab/View/Dialog/SearchResultPageProps'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'

  export let props: SearchResultPageProps
</script>

<div class="search-result-page_root">
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
  @use 'src/TreeifyTab/View/common.scss';

  .search-result-page_page {
    display: flex;
    align-items: center;
  }

  .search-result-page_page-icon {
    @include common.square(1.1em);

    // lch(30.0%, 0.0, 0.0)相当
    @include common.icon(#474747, url('page.svg'));
  }

  .search-result-page_tree {
    // lch(70.0%, 0.0, 0.0)相当
    border: solid 1px #ababab;
    border-radius: 0.7em;
    padding: 0.5em 0.5em 0.5em 1em;
  }
</style>
