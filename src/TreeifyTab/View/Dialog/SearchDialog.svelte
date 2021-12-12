<script lang="ts">
  import { List } from 'immutable'
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import SearchResultPage from 'src/TreeifyTab/View/Dialog/SearchResultPage.svelte'
  import { createSearchResultPageProps } from 'src/TreeifyTab/View/Dialog/SearchResultPageProps.js'

  let searchQueryValue = ''
  let searchResult: List<List<ItemPath>> | undefined
  const workspaceId = CurrentState.getCurrentWorkspaceId()
  const searchHistory = Internal.instance.state.workspaces[workspaceId].searchHistory

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
      case '1100KeyR':
        event.preventDefault()
        Command.showReplaceDialog()
        Rerenderer.instance.rerender()
        break
      case '1100KeyF':
        event.preventDefault()
        document.querySelector<HTMLElement>('.search-dialog_search-query')?.focus()
        document.execCommand('selectAll')
        break
    }
  }

  function onSearchQueryKeyDown(event: KeyboardEvent) {
    if (event.isComposing) return

    // Enterキー押下時
    if (InputId.fromKeyboardEvent(event) === '0000Enter') {
      event.preventDefault()

      // 検索履歴に保存
      const workspaceId = CurrentState.getCurrentWorkspaceId()
      const searchHistory = Internal.instance.state.workspaces[workspaceId].searchHistory
      const newHistory = searchHistory
        .filter((searchQuery) => searchQuery !== searchQueryValue)
        .push(searchQueryValue)
        .takeLast(10)
      Internal.instance.mutate(
        newHistory,
        PropertyPath.of('workspaces', workspaceId, 'searchHistory')
      )

      // 全文検索
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

<CommonDialog class="search-dialog_root" title="検索" showCloseButton>
  <div class="search-dialog_content" on:keydown={onContentAreaKeyDown}>
    <input
      type="text"
      class="search-dialog_search-query"
      placeholder="検索ワード -除外ワード"
      list="search-dialog_search-history-list"
      bind:value={searchQueryValue}
      on:keydown={onSearchQueryKeyDown}
    />
    {#if searchResult === undefined}
      <datalist id="search-dialog_search-history-list">
        {#each searchHistory.reverse().toArray() as searchQuery}
          <option value={searchQuery} />
        {/each}
      </datalist>
    {/if}
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
