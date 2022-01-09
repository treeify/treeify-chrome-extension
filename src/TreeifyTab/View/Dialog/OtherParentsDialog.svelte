<script lang="ts">
  import { Set } from 'immutable'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import OtherParentsDialogPage from 'src/TreeifyTab/View/Dialog/OtherParentsDialogPage.svelte'
  import { createOtherParentsDialogPageProps } from 'src/TreeifyTab/View/Dialog/OtherParentsDialogPageProps'
  import { RArray$ } from 'src/Utility/fp-ts'

  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const parentItemIds = CurrentState.getParentItemIds(targetItemId)

  const itemPaths = parentItemIds
    .flatMap((parentItemId) => [...CurrentState.yieldItemPaths(parentItemId)])
    .map(RArray$.append(targetItemId))
    .filter((itemPath) => !RArray$.shallowEqual(itemPath, targetItemPath))
  const pagePropses = Set(itemPaths)
    .groupBy((itemPath) => ItemPath.getRootItemId(itemPath))
    .toList()
    .map((itemPaths) => createOtherParentsDialogPageProps(itemPaths.toList().toArray()))
</script>

<CommonDialog class="other-parents-dialog_root" title="他のトランスクルード元" showCloseButton>
  <div class="other-parents-dialog_content" tabindex="0">
    {#each pagePropses.toArray() as pageProps}
      <OtherParentsDialogPage props={pageProps} />
    {/each}
  </div>
</CommonDialog>

<style global lang="scss">
  .other-parents-dialog_content {
    min-width: 15em;
    padding: 1em;

    display: flex;
    flex-direction: column;
    row-gap: 0.3em;

    outline: none;

    max-height: 100%;
    overflow-y: auto;
  }
</style>
