<script lang="ts">
  import {List} from 'immutable'
  import {doWithErrorCapture} from '../../errorCapture'
  import {CurrentState} from '../../Internal/CurrentState'
  import {InputId} from '../../Internal/InputId'
  import {Internal} from '../../Internal/Internal'
  import {ItemPath} from '../../Internal/ItemPath'
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import {createItemContentProps} from '../ItemContent/ItemContentProps'
  import CommonDialog from './CommonDialog.svelte'
  import {SearchDialogProps} from './SearchDialogProps'
  import SearchResultRow from './SearchResultRow.svelte'

  export let props: SearchDialogProps

  let searchResult: List<List<ItemPath>> = List.of()

  function onInput(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) return

    // インクリメンタルサーチを行う。もし重くなったら方針を見直す
    const itemIds = Internal.instance.searchEngine.search(event.target.value)

    // ヒットしたアイテムの所属ページを探索し、その経路をItemPathとして収集する
    const allItemPaths = itemIds.flatMap((itemId) => List(CurrentState.yieldItemPaths(itemId)))

    // ItemPathをページIDでグループ化する
    const itemPathGroups: List<List<ItemPath>> = allItemPaths
      .groupBy((itemPath) => ItemPath.getRootItemId(itemPath))
      .toList()
      .map((group) => group.toList())

    // ヒットしたアイテム数によってページの並びをソートする
    searchResult = itemPathGroups.sortBy((itemPaths) => -itemPaths.size)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    doWithErrorCapture(() => {
      if (event.isComposing) return

      // Enterキー押下時
      if (InputId.fromKeyboardEvent(event) === '0000Enter') {
        // TODO: 検索結果の一番上の項目にジャンプするのが有力
      }
    })
  }
</script>

<CommonDialog title="検索">
  <div class="search-dialog_content">
    <input
      type="text"
      class="search-dialog_search-query"
      placeholder="検索ワード"
      on:input={onInput}
    />
    <div class="search-dialog_result">
      {#each searchResult.toArray() as itemPathGroup (ItemPath.getRootItemId(itemPathGroup.first()))}
        <ItemContent
          props={createItemContentProps(ItemPath.getRootItemId(itemPathGroup.first()))}
        />
        <div class="search-dialog_result-items-for-each-page">
          {#each itemPathGroup.toArray() as itemPath (itemPath.toString())}
            <SearchResultRow {itemPath} />
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
