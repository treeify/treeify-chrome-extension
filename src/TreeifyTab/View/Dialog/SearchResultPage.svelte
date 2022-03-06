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
    {#each props.searchResultItemPropses as searchResultItemProps (searchResultItemProps.itemPath.toString())}
      <SearchResultItem props={searchResultItemProps} />
    {/each}
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .search-result-page_page {
    display: flex;
    align-items: center;
    gap: common.em(0.2);
  }

  .search-result-page_page-icon {
    @include common.size(common.em(1.05));

    @include common.icon(var(--page-icon-color), url('page.svg'));
  }

  .search-result-page_tree {
    border: solid 1px lch(70% 0 0);
    border-radius: common.em(0.7);
    padding: common.em(0.5) common.em(0.5) common.em(0.5) common.em(1);
  }
</style>
