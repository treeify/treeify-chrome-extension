<script lang="ts">
  import {List} from 'immutable'
  import {ItemId} from '../../basicType'
  import {doWithErrorCapture} from '../../errorCapture'
  import {CurrentState} from '../../Internal/CurrentState'
  import {InputId} from '../../Internal/InputId'
  import {Internal} from '../../Internal/Internal'
  import {Rerenderer} from '../../Rerenderer'
  import CommonDialog from './CommonDialog.svelte'
  import {SearchDialogProps} from './SearchDialogProps'
  import SearchResultRow from './SearchResultRow.svelte'

  export let props: SearchDialogProps

  let searchResult: List<ItemId> = List.of()

  const closeDialog = () => {
    // ダイアログを閉じる
    CurrentState.setSearchDialog(null)
    Rerenderer.instance.rerender()
  }

  function onInput(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) return

    // インクリメンタルサーチを行う。もし重くなったら方針を見直す
    searchResult = Internal.instance.searchEngine.search(event.target.value)
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

<CommonDialog title="検索" onCloseDialog={closeDialog}>
  <div class="search-dialog_content">
    <input
      type="text"
      class="search-dialog_search-query"
      placeholder="検索ワード"
      on:input={onInput}
    />
    {#each searchResult.toArray() as itemId (itemId.toString())}
      <SearchResultRow {itemId} />
    {/each}
  </div>
</CommonDialog>

<style>
  .search-dialog_content {
    padding: 1em;
  }
</style>
