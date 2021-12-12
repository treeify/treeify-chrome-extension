<script lang="ts">
  import { List, Set } from 'immutable'
  import { TabsDialog } from 'src/TreeifyTab/External/DialogState'
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import TabsDialogItem from 'src/TreeifyTab/View/Dialog/TabsDialogItem.svelte'
  import {
    createTabsDialogItemProps,
    TabsDialogItemProps,
  } from 'src/TreeifyTab/View/Dialog/TabsDialogItemProps'

  export let dialog: TabsDialog

  const webPageItemIds = Set(CurrentState.yieldSubtreeItemIdsShallowly(dialog.targetItemId)).filter(
    (itemId) => External.instance.tabItemCorrespondence.getTabIdBy(itemId) !== undefined
  )
  const rootNode = CurrentState.treeify(
    webPageItemIds.add(dialog.targetItemId),
    dialog.targetItemId
  )

  const items = List(rootNode.children).map((tree) => {
    return tree.fold((itemPath, children: TabsDialogItemProps[]) =>
      createTabsDialogItemProps(itemPath, List(children))
    )
  })
</script>

<CommonDialog class="tabs-dialog_root" title="タブ一覧" showCloseButton>
  <div class="tabs-dialog_content" tabindex="0">
    {#each items.toArray() as tabsDialogItemProps}
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
