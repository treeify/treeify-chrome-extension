<script lang="ts">
  import {tick} from 'svelte'
  import {assertNonNull} from '../../../Common/Debug/assert'
  import {doWithErrorCapture} from '../../errorCapture'
  import {CurrentState} from '../../Internal/CurrentState'
  import {Internal} from '../../Internal/Internal'
  import {ItemPath} from '../../Internal/ItemPath'
  import {PropertyPath} from '../../Internal/PropertyPath'
  import {Rerenderer} from '../../Rerenderer'
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import {createItemContentProps} from '../ItemContent/ItemContentProps'
  import {MainAreaContentView} from '../MainArea/MainAreaContentProps'
  import SearchResultRow from './SearchResultRow.svelte'
  import {SearchResultRowProps} from './SearchResultRowProps'

  export let props: SearchResultRowProps

  function onClick(event: MouseEvent) {
    doWithErrorCapture(() => {
      const containerPageId = ItemPath.getRootItemId(props.itemPath)

      // ジャンプ先のページのtargetItemPathを更新する
      Internal.instance.mutate(
        props.itemPath,
        PropertyPath.of('pages', containerPageId, 'targetItemPath')
      )
      Internal.instance.mutate(
        props.itemPath,
        PropertyPath.of('pages', containerPageId, 'anchorItemPath')
      )

      CurrentState.moses(props.itemPath)

      // ページを切り替える
      CurrentState.switchActivePage(containerPageId)

      // 再描画完了後に対象アイテムに自動スクロールする
      tick().then(() => {
        const targetElementId = MainAreaContentView.focusableDomElementId(props.itemPath)
        const focusableElement = document.getElementById(targetElementId)
        assertNonNull(focusableElement)
        focusableElement.scrollIntoView({
          behavior: 'auto',
          block: 'center',
          inline: 'center',
        })
      })

      // 検索ダイアログを閉じる
      CurrentState.setDialog(null)
      Rerenderer.instance.rerender()
    })
  }
</script>

<div class="search-result-row" on:click={onClick}>
  <ItemContent props={createItemContentProps(ItemPath.getItemId(props.itemPath))} />
  <div class="search-result-row_indent-and-children-area">
    <div class="search-result-row_indent-area" />
    <div class="search-result-row_children-area">
      {#each props.children.toArray() as child (child.itemPath.toString())}
        <SearchResultRow props={child} />
      {/each}
    </div>
  </div>
</div>

<style>
  .search-result-row {
    cursor: pointer;
  }

  .search-result-row_indent-and-children-area {
    display: flex;
  }

  .search-result-row_indent-area {
    width: 1.1em;
  }
</style>
