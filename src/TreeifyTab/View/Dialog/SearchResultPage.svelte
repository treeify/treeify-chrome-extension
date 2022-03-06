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
    gap: common.toIntegerPx(0.2em);
  }

  .search-result-page_page-icon {
    @include common.size(common.toIntegerPx(1.05em));

    @include common.icon(var(--page-icon-color), url('page.svg'));
  }

  .search-result-page_tree {
    border: solid 1px oklch(70% 0 0);
    border-radius: common.toIntegerPx(0.7em);
    padding: common.toIntegerPx(0.5em) common.toIntegerPx(0.5em) common.toIntegerPx(0.5em)
      common.toIntegerPx(1em);
  }
</style>
