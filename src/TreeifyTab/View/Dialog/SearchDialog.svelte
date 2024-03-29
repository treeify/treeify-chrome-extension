<script lang="ts">
  import { pipe } from 'fp-ts/function'
  import { MultiSet } from 'mnemonist'
  import { allItemTypes, ItemId, ItemType, itemTypeDisplayNames } from 'src/TreeifyTab/basicType'
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import Checkbox from 'src/TreeifyTab/View/Checkbox.svelte'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import { SearchDialogProps } from 'src/TreeifyTab/View/Dialog/SearchDialogProps'
  import SearchResultPage from 'src/TreeifyTab/View/Dialog/SearchResultPage.svelte'
  import { createSearchResultPageProps } from 'src/TreeifyTab/View/Dialog/SearchResultPageProps'
  import { NERArray, NERArray$, RArray, RArray$, RRecord$, RSet, RSet$ } from 'src/Utility/fp-ts'

  export let props: SearchDialogProps

  type SearchResult = { pages: RArray<RArray<ItemPath>>; counts: MultiSet<ItemType> }

  let searchQueryValue = props.initialSearchQuery ?? ''
  let hitItemIds: RSet<ItemId> | undefined
  let checkedItemTypes: Record<ItemType, boolean> = RRecord$.fromEntries(
    allItemTypes.map((itemType) => [itemType, true] as const)
  )
  let searchResult: SearchResult | undefined
  $: searchResult = makeSearchResult(hitItemIds, checkedItemTypes)

  const workspaceId = External.instance.getCurrentWorkspaceId()
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
        External.instance.dialogState = {
          type: 'ReplaceDialog',
          initialBeforeReplace: searchQueryValue,
        }
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
      const workspaceId = External.instance.getCurrentWorkspaceId()
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
      checkedItemTypes = RRecord$.fromEntries(
        allItemTypes.map((itemType) => [itemType, true] as const)
      )
      document.querySelector<HTMLElement>('.search-dialog_result-area')?.scrollTo(0, 0)
    }
  }

  function makeSearchResult(
    hitItemIds: RSet<ItemId> | undefined,
    checkedItemTypes: Record<ItemType, boolean>
  ): SearchResult | undefined {
    if (hitItemIds === undefined) return undefined

    const filteredItemIds = RSet$.filter(
      (itemId: ItemId) => checkedItemTypes[Internal.instance.state.items[itemId].type]
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
      // ヒットした項目のタイムスタンプが新しい順にページをソートする
      RArray$.sortByNumber((itemPathsInPage: NERArray<ItemPath>) => {
        return -pipe(
          itemPathsInPage,
          NERArray$.map((itemPath: ItemPath) => {
            const itemId = ItemPath.getItemId(itemPath)
            return Internal.instance.state.items[itemId].timestamp
          }),
          NERArray$.max
        )
      })
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
            <option class="search-dialog_search-history-option" value={searchQuery} />
          {/each}
        </datalist>
      {/if}
    </div>
    <div class="search-dialog_result-area">
      {#if searchResult !== undefined}
        <div class="search-dialog_filter-area">
          表示する項目:
          {#each RRecord$.entries(itemTypeDisplayNames) as [itemType, name]}
            {#if searchResult.counts.get(itemType) > 0}
              <Checkbox value={itemType} bind:checked={checkedItemTypes[itemType]}>
                {name}({searchResult.counts.get(itemType)}件)
              </Checkbox>
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
  @use 'src/TreeifyTab/View/common.scss';

  .search-dialog_content {
    // 検索結果一覧領域だけをスクロール可能にするための設定
    max-height: 100%;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);

    min-width: common.toIntegerPx(25em);
    padding: common.toIntegerPx(1em);
  }

  .search-dialog_search-box {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .search-dialog_search-query {
    padding: common.toIntegerPx(0.35em);
    font-size: 95%;
  }

  .search-dialog_filter-area {
    display: flex;
    align-items: center;
    gap: common.toIntegerPx(0.3em);
    padding: common.toIntegerPx(0.5em);
  }

  .search-dialog_result-area {
    overflow-y: auto;
  }

  .search-dialog_result {
    display: flex;
    flex-direction: column;
    row-gap: common.toIntegerPx(1em);

    padding-bottom: common.toIntegerPx(1em);
  }
</style>
