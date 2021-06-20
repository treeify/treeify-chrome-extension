<script lang="ts">
  import {ItemId} from '../../basicType'
  import {doWithErrorCapture} from '../../errorCapture'
  import {CurrentState} from '../../Internal/CurrentState'
  import {Internal} from '../../Internal/Internal'
  import {ItemPath} from '../../Internal/ItemPath'
  import {PropertyPath} from '../../Internal/PropertyPath'
  import {Rerenderer} from '../../Rerenderer'
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import {createItemContentProps} from '../ItemContent/ItemContentProps'

  export let itemId: ItemId

  function onClick(event: MouseEvent) {
    doWithErrorCapture(() => {
      // 所属ページとそこに至るItemPathを探索する
      // TODO: マウントされているページを優先すべき & 足跡が新しいページを優先するべき
      const firstItemPath = CurrentState.yieldItemPaths(itemId).next().value
      const containerPageId = ItemPath.getRootItemId(firstItemPath)

      // 得られたItemPathをtargetItemPathにする
      const containerPage = Internal.instance.state.pages[containerPageId]
      containerPage.targetItemPath = firstItemPath
      containerPage.anchorItemPath = firstItemPath
      Internal.instance.markAsMutated(PropertyPath.of('pages', containerPageId, 'targetItemPath'))
      Internal.instance.markAsMutated(PropertyPath.of('pages', containerPageId, 'anchorItemPath'))

      // TODO: モーセ

      // 所属ページに切り替える
      CurrentState.switchActivePage(containerPageId)

      // 検索ダイアログを閉じる
      CurrentState.setSearchDialog(null)
      Rerenderer.instance.rerender()
    })
  }
</script>

<div class="search-result-row" on:click={onClick}>
  <ItemContent props={createItemContentProps(itemId)} />
</div>

<style>
  .search-result-row {
    cursor: pointer;
  }
</style>
