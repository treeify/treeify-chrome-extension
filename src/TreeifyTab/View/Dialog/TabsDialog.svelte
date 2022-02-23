<script lang="ts">
  import { pipe } from 'fp-ts/function'
  import { ItemId } from 'src/TreeifyTab/basicType'
  import { TabsDialog } from 'src/TreeifyTab/External/DialogState'
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import TabsDialogItem from 'src/TreeifyTab/View/Dialog/TabsDialogItem.svelte'
  import {
    createTabsDialogItemProps,
    TabsDialogItemProps,
  } from 'src/TreeifyTab/View/Dialog/TabsDialogItemProps'
  import { CssCustomProperty } from 'src/Utility/browser'
  import { RSet$ } from 'src/Utility/fp-ts'
  import { integer } from 'src/Utility/integer'

  export let dialog: TabsDialog
  const targetItemId: ItemId =
    dialog.targetItem instanceof Array ? ItemPath.getItemId(dialog.targetItem) : dialog.targetItem
  const pageId: ItemId =
    dialog.targetItem instanceof Array
      ? ItemPath.getRootItemId(dialog.targetItem)
      : dialog.targetItem

  const webPageItemIds = pipe(
    RSet$.from(CurrentState.yieldSubtreeItemIdsShallowly(targetItemId)),
    (subtreeItemIds) => RSet$.difference(subtreeItemIds, RSet$.singleton(targetItemId)),
    RSet$.filter(
      (itemId: ItemId) => External.instance.tabItemCorrespondence.getTabId(itemId) !== undefined
    )
  )
  const rootNode = CurrentState.treeify(RSet$.add(pageId)(webPageItemIds), pageId, false)

  const items = Internal.instance.state.items
  const ranking = Array.from(webPageItemIds).sort((a: ItemId, b: ItemId) => {
    return items[b].timestamp - items[a].timestamp
  })
  const exponent = CssCustomProperty.getNumber('--search-result-footprint-count-exponent') ?? 0.5
  const footprintCount = Math.floor(webPageItemIds.size ** exponent)
  // 各項目に足跡順位を対応付け
  const footprintRankMap = new Map<ItemId, integer>()
  for (let i = 0; i < footprintCount; i++) {
    footprintRankMap.set(ranking[i], i)
  }

  const tabsDialogItemPropses = rootNode.children.map((tree) => {
    return tree.fold((itemPath, children: TabsDialogItemProps[]) => {
      const footprintRank = footprintRankMap.get(ItemPath.getItemId(itemPath))
      return createTabsDialogItemProps(itemPath, children, footprintRank, footprintCount)
    })
  })
</script>

<CommonDialog class="tabs-dialog_root" title="タブ一覧" showCloseButton>
  <div class="tabs-dialog_content" tabindex="0">
    {#each tabsDialogItemPropses as tabsDialogItemProps}
      <TabsDialogItem props={tabsDialogItemProps} />
    {/each}
  </div>
</CommonDialog>

<style global lang="scss">
  .tabs-dialog_content {
    min-width: 20em;
    padding: 1em;

    outline: none;

    max-height: 100%;
    overflow-y: auto;
  }
</style>
