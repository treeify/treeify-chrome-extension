<script lang="ts">
  import { List } from 'immutable'
  import { doWithErrorCapture } from 'src/TreeifyTab/errorCapture'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import { SearchDialogProps } from 'src/TreeifyTab/View/Dialog/SearchDialogProps'
  import SearchResultPage from 'src/TreeifyTab/View/Dialog/SearchResultPage.svelte'
  import { createSearchResultPageProps } from 'src/TreeifyTab/View/Dialog/SearchResultPageProps.js'

  export let props: SearchDialogProps

  let searchResult: List<List<ItemPath>> | undefined

  function onKeyDownSearchQuery(event: KeyboardEvent) {
    doWithErrorCapture(() => {
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
    })
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
    // 検索結果一覧領域だけをスクロール可能にするための設定
    max-height: 100%;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);

    min-width: 25em;
    padding: 1em;
  }

  .search-dialog_search-query {
    width: 100%;
  }

  .search-dialog_result {
    margin-block: 1em;

    display: flex;
    flex-direction: column;
    row-gap: 1em;

    overflow-y: auto;
  }
</style>
