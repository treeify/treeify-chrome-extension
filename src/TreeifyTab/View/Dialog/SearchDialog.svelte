<script lang="ts">
  import {List} from 'immutable'
  import {CurrentState} from '../../Internal/CurrentState'
  import {InputId} from '../../Internal/InputId'
  import {Internal} from '../../Internal/Internal'
  import {ItemPath} from '../../Internal/ItemPath'
  import CommonDialog from './CommonDialog.svelte'
  import {SearchDialogProps} from './SearchDialogProps'
  import SearchResultPage from './SearchResultPage.svelte'
  import {createSearchResultPageProps} from './SearchResultPageProps'

  export let props: SearchDialogProps

  let searchResult: List<List<ItemPath>> | undefined

  function onKeyDownSearchQuery(event: KeyboardEvent) {
    if (event.isComposing) return
    if (!(event.target instanceof HTMLInputElement)) return

    // Enterキー押下時
    if (InputId.fromKeyboardEvent(event) === '0000Enter') {
      event.preventDefault()

      const itemIds = Internal.instance.searchEngine.search(event.target.value)

      // ヒットした項目の所属ページを探索し、その経路をItemPathとして収集する
      const allItemPaths = itemIds.flatMap((itemId) => List(CurrentState.yieldItemPaths(itemId)))

      searchResult = allItemPaths
        // ItemPathをページIDでグループ化する
        .groupBy((itemPath) => ItemPath.getRootItemId(itemPath))
        .toList()
        .map((itemPaths) => itemPaths.toList())
        // ヒットした項目数によってページの並びをソートする
        .sortBy((itemPaths) => -itemPaths.size)
    }
  }
</script>

<CommonDialog title="検索" showCloseButton>
  <div class="search-dialog_content" on:keydown={props.onKeyDown}>
    <input
      type="text"
      class="search-dialog_search-query"
      placeholder="検索ワード -除外ワード"
      on:keydown={onKeyDownSearchQuery}
    />
    <div class="search-dialog_result">
      {#if searchResult !== undefined}
        {#each searchResult.toArray() as itemPaths}
          <SearchResultPage props={createSearchResultPageProps(itemPaths)} />
        {:else}
          <div>検索結果はありません</div>
        {/each}
      {/if}
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .search-dialog_content {
    padding: 1em;
  }

  .search-dialog_search-query {
    width: 100%;
  }
</style>
