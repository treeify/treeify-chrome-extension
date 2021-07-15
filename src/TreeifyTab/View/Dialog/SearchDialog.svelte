<script lang="ts">
  import {List} from 'immutable'
  import {CurrentState} from '../../Internal/CurrentState'
  import {InputId} from '../../Internal/InputId'
  import {Internal} from '../../Internal/Internal'
  import {ItemPath} from '../../Internal/ItemPath'
  import CommonDialog from './CommonDialog.svelte'
  import {SearchDialogProps} from './SearchDialogProps'
  import SearchResultRow from './SearchResultRow.svelte'
  import {createSearchResultRowPropses, SearchResultRowProps} from './SearchResultRowProps'

  export let props: SearchDialogProps

  let searchResult: List<List<SearchResultRowProps>> = List.of()

  function onKeyDownSearchQuery(event: KeyboardEvent) {
    if (event.isComposing) return
    if (!(event.target instanceof HTMLInputElement)) return

    // Enterキー押下時
    if (InputId.fromKeyboardEvent(event) === '0000Enter') {
      event.preventDefault()

      const itemIds = Internal.instance.searchEngine.search(event.target.value)

      // ヒットしたアイテムの所属ページを探索し、その経路をItemPathとして収集する
      const allItemPaths = itemIds.flatMap((itemId) => List(CurrentState.yieldItemPaths(itemId)))

      // ItemPathをページIDでグループ化する
      const itemPathGroups = allItemPaths
        .groupBy((itemPath) => ItemPath.getRootItemId(itemPath))
        .toList()
        .map((itemPaths) => itemPaths.toList())
        // ヒットしたアイテム数によってページの並びをソートする
        .sortBy((itemPaths) => -itemPaths.size)

      searchResult = itemPathGroups.map(createSearchResultRowPropses)
    }
  }
</script>

<CommonDialog title="検索">
  <div class="search-dialog_content">
    <input
      type="text"
      class="search-dialog_search-query"
      placeholder="検索ワード"
      on:keydown={onKeyDownSearchQuery}
    />
    <div class="search-dialog_result">
      {#each searchResult.toArray() as searchResultRowPropses}
        <div class="search-dialog_result-items-for-each-page">
          {#each searchResultRowPropses.toArray() as searchResultRowProps (searchResultRowProps.toString())}
            <SearchResultRow props={searchResultRowProps} />
          {/each}
        </div>
      {/each}
    </div>
  </div>
</CommonDialog>

<style>
  .search-dialog_content {
    padding: 1em;
  }

  .search-dialog_search-query {
    width: 100%;
  }

  .search-dialog_result-items-for-each-page {
    border: solid 1px hsl(0, 0%, 70%);
    border-radius: 0.7em;
    padding: 0.5em 0.5em 0.5em 1em;
  }
</style>
