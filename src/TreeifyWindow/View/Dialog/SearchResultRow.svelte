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

  export let itemPath: ItemPath

  function onClick(event: MouseEvent) {
    doWithErrorCapture(() => {
      const containerPageId = ItemPath.getRootItemId(itemPath)

      // ジャンプ先のページのtargetItemPathを更新する
      Internal.instance.mutate(
        itemPath,
        PropertyPath.of('pages', containerPageId, 'targetItemPath')
      )
      Internal.instance.mutate(
        itemPath,
        PropertyPath.of('pages', containerPageId, 'anchorItemPath')
      )

      CurrentState.moses(itemPath)

      // ページを切り替える
      CurrentState.switchActivePage(containerPageId)

      // 再描画完了後に対象アイテムに自動スクロールする
      tick().then(() => {
        const targetElementId = MainAreaContentView.focusableDomElementId(itemPath)
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
  <ItemContent props={createItemContentProps(ItemPath.getItemId(itemPath))} />
</div>

<style>
  .search-result-row {
    cursor: pointer;
  }
</style>
