<script lang="ts">
  import { pipe } from 'fp-ts/function'
  import { MultiSet } from 'mnemonist'
  import { ItemId, ItemType, itemTypeDisplayNames } from 'src/TreeifyTab/basicType'
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import SearchResultPage from 'src/TreeifyTab/View/Dialog/SearchResultPage.svelte'
  import { createSearchResultPageProps } from 'src/TreeifyTab/View/Dialog/SearchResultPageProps'
  import { RArray, RArray$, RSet, RSet$ } from 'src/Utility/fp-ts'

  type SearchResult = { pages: RArray<RArray<ItemPath>>; counts: MultiSet<ItemType> }

  let searchQueryValue = ''
  let hitItemIds: RSet<ItemId> | undefined
  let checkedItemTypes: ItemType[] = Object.values(ItemType) as any
  let searchResult: SearchResult | undefined
  $: searchResult = makeSearchResult(hitItemIds, RSet$.from(checkedItemTypes))

  const workspaceId = CurrentState.getCurrentWorkspaceId()
  const searchHistory = Internal.instance.state.workspaces[workspaceId].searchHistory

  function onContentAreaKeyDown(event: KeyboardEvent) {
    if (event.isComposing) return

    const inputId = InputId.fromKeyboardEvent(event)
    switch (inputId) {
      case '0000ArrowDown':
      case '0000ArrowUp':
        event.preventDefault()

        const focusableElements = Array.from(
          document.querySelectorAll<HTMLElement>(
            '.search-dialog_search-query, .search-dialog_content [tabindex]'
          )
        )
        const index = focusableElements.findIndex((element) => document.activeElement === element)
        if (index === -1) return

        if (inputId === '0000ArrowDown') {
          // フォーカスを次の要素に移す
          const nextIndex = (index + 1) % focusableElements.length
          focusableElements[nextIndex].focus()
        } else {
          // フォーカスを前の要素に移す
          const prevIndex = (index - 1 + focusableElements.length) % focusableElements.length
          focusableElements[prevIndex].focus()
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
      const newHistory = pipe(
        searchHistory,
        RArray$.filter((searchQuery: string) => searchQuery !== searchQueryValue),
        RArray$.append(searchQueryValue)
      )
      Internal.instance.mutate(
        RArray$.takeRight(10)(newHistory),
        StatePath.of('workspaces', workspaceId, 'searchHistory')
      )

      hitItemIds = Internal.instance.searchEngine.search(searchQueryValue)
      checkedItemTypes = Object.values(ItemType) as any
      document.querySelector<HTMLElement>('.search-dialog_result-area')?.scrollTo(0, 0)
    }
  }

  function makeSearchResult(
    hitItemIds: RSet<ItemId> | undefined,
    itemTypes: RSet<ItemType>
  ): SearchResult | undefined {
    if (hitItemIds === undefined) return undefined

    const filteredItemIds = RSet$.filter((itemId: ItemId) =>
      itemTypes.has(Internal.instance.state.items[itemId].type)
    )(hitItemIds)

    // ヒットした項目の所属ページを探索し、その経路をItemPathとして収集する
    const allItemPaths = pipe(
      filteredItemIds,
      RSet$.flatMap((itemId: ItemId) => RSet$.from(CurrentState.yieldItemPaths(itemId)))
    )

    const pages = pipe(
      RArray$.from(allItemPaths),
      // ItemPathをページIDでグループ化する
      RArray$.groupBy((itemPath: ItemPath) => String(ItemPath.getRootItemId(itemPath))),
      Object.values,
      // ヒットした項目数によってページの並びをソートする
      RArray$.sortByNumber((entry: RArray<ItemPath>) => -entry.length)
    )

    const counts = new MultiSet<ItemType>()
    for (const hitItemId of hitItemIds) {
      const itemType = Internal.instance.state.items[hitItemId].type
      counts.add(itemType)
    }
    return { pages, counts }
  }
</script>

<CommonDialog class="search-dialog_root" title="検索" showCloseButton>
  <div class="search-dialog_content" on:keydown={onContentAreaKeyDown}>
    <div class="search-dialog_search-box">
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
          {#each RArray$.reverse(searchHistory) as searchQuery}
            <option value={searchQuery} />
          {/each}
        </datalist>
      {/if}
    </div>
    <div class="search-dialog_result-area">
      {#if searchResult !== undefined}
        <div class="search-dialog_filter-area">
          表示する項目:
          {#each Object.entries(itemTypeDisplayNames) as [itemType, name]}
            {#if searchResult.counts.get(itemType) > 0}
              <label class="search-dialog_checkbox-label">
                <input type="checkbox" bind:group={checkedItemTypes} value={itemType} />
                {name}({searchResult.counts.get(itemType)}件)
              </label>
            {/if}
          {/each}
        </div>
        {#if searchResult.pages.length > 0}
          <div class="search-dialog_result">
            {#each searchResult.pages as itemPaths}
              <SearchResultPage props={createSearchResultPageProps(itemPaths)} />
            {/each}
          </div>
        {:else}
          <div class="search-dialog_empty-message">検索結果はありません</div>
        {/if}
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

  .search-dialog_search-box {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .search-dialog_search-query {
    padding-block: 0.5em;
    padding-left: 0.5em;
  }

  .search-dialog_filter-area {
    display: flex;
    align-items: center;
    gap: 0.3em;
    padding: 0.5em;
  }

  .search-dialog_checkbox-label {
    display: inline-flex;
    align-items: center;

    cursor: pointer;
  }

  .search-dialog_result-area {
    padding-bottom: 1em;

    overflow-y: auto;
  }

  .search-dialog_result {
    display: flex;
    flex-direction: column;
    row-gap: 1em;
  }
</style>
