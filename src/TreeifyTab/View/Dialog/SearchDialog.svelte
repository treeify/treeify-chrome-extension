<script lang="ts">
  import { List } from 'immutable'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import SearchResultPage from 'src/TreeifyTab/View/Dialog/SearchResultPage.svelte'
  import { createSearchResultPageProps } from 'src/TreeifyTab/View/Dialog/SearchResultPageProps.js'

  let searchQueryValue = ''
  let searchResult: List<List<ItemPath>> | undefined

  function onContentAreaKeyDown(event: KeyboardEvent) {
    if (event.isComposing) return

    const inputId = InputId.fromKeyboardEvent(event)
    switch (inputId) {
      case '0000ArrowDown':
      case '0000ArrowUp':
        event.preventDefault()

        const focusableElements = List(
          document.querySelectorAll(
            '.search-dialog_content input, .search-dialog_content [tabindex]'
          )
        ) as List<HTMLElement>
        const index = focusableElements.findIndex((element) => document.activeElement === element)
        if (index === -1) return

        if (inputId === '0000ArrowDown') {
          // フォーカスを次の要素に移す
          const nextIndex = (index + 1) % focusableElements.size
          focusableElements.get(nextIndex)!.focus()
        } else {
          // フォーカスを前の要素に移す
          const prevIndex = (index - 1) % focusableElements.size
          focusableElements.get(prevIndex)!.focus()
        }
        break
    }
  }

  function onSearchQueryKeyDown(event: KeyboardEvent) {
    if (event.isComposing) return

    // Enterキー押下時
    if (InputId.fromKeyboardEvent(event) === '0000Enter') {
      event.preventDefault()

      const itemIds = Internal.instance.searchEngine.search(searchQueryValue)

      // ヒットした項目の所属ページを探索し、その経路をItemPathとして収集する
      const allItemPaths = itemIds.flatMap((itemId) => CurrentState.yieldItemPaths(itemId))

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
  <div class="search-dialog_content" on:keydown={onContentAreaKeyDown}>
    <input
      type="text"
      class="search-dialog_search-query"
      placeholder="検索ワード -除外ワード"
      bind:value={searchQueryValue}
      on:keydown={onSearchQueryKeyDown}
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
    margin-top: 1em;
    padding-bottom: 1em;

    display: flex;
    flex-direction: column;
    row-gap: 1em;

    overflow-y: auto;
  }
</style>
