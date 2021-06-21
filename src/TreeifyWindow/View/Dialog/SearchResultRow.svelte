<script lang="ts">
  import {tick} from 'svelte'
  import {assertNonNull} from '../../../Common/Debug/assert'
  import {ItemId} from '../../basicType'
  import {doWithErrorCapture} from '../../errorCapture'
  import {CurrentState} from '../../Internal/CurrentState'
  import {Internal} from '../../Internal/Internal'
  import {ItemPath} from '../../Internal/ItemPath'
  import {PropertyPath} from '../../Internal/PropertyPath'
  import {Rerenderer} from '../../Rerenderer'
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import {createItemContentProps} from '../ItemContent/ItemContentProps'
  import {ItemTreeContentView} from '../ItemTree/ItemTreeContentProps'

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

      CurrentState.moses(firstItemPath)

      // 所属ページに切り替える
      CurrentState.switchActivePage(containerPageId)

      // 再描画完了後に対象アイテムに自動スクロールする
      tick().then(() => {
        const targetElementId = ItemTreeContentView.focusableDomElementId(firstItemPath)
        const focusableElement = document.getElementById(targetElementId)
        assertNonNull(focusableElement)
        focusableElement.scrollIntoView({
          behavior: 'auto',
          block: 'center',
          inline: 'center',
        })
      })

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
