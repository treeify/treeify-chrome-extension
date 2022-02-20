<script lang="ts">
  import { pipe } from 'fp-ts/function'
  import { ItemId } from 'src/TreeifyTab/basicType'
  import { TabsDialog } from 'src/TreeifyTab/External/DialogState'
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import TabsDialogItem from 'src/TreeifyTab/View/Dialog/TabsDialogItem.svelte'
  import {
    createTabsDialogItemProps,
    TabsDialogItemProps,
  } from 'src/TreeifyTab/View/Dialog/TabsDialogItemProps'
  import { RSet$ } from 'src/Utility/fp-ts'

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

  const items = rootNode.children.map((tree) => {
    return tree.fold((itemPath, children: TabsDialogItemProps[]) =>
      createTabsDialogItemProps(itemPath, children)
    )
  })
</script>

<CommonDialog class="tabs-dialog_root" title="タブ一覧" showCloseButton>
  <div class="tabs-dialog_content" tabindex="0">
    {#each items as tabsDialogItemProps}
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
