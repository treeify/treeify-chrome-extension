<script lang="ts">
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import AdjacentItems from 'src/TreeifyTab/View/Dialog/AdjacentItems.svelte'
  import { createAdjacentItemsProps } from 'src/TreeifyTab/View/Dialog/AdjacentItemsProps'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import { RArray$ } from 'src/Utility/fp-ts'

  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const parentItemIds = CurrentState.getParentItemIds(targetItemId)

  const itemPaths = parentItemIds
    .flatMap((parentItemId) => [...CurrentState.yieldItemPaths(parentItemId)])
    .map(RArray$.append(targetItemId))
    .filter((itemPath) => !RArray$.shallowEqual(itemPath, targetItemPath))

  const adjacentItemsPropses = itemPaths.map(createAdjacentItemsProps)
</script>

<CommonDialog class="other-parents-dialog_root" title="他のトランスクルード元" showCloseButton>
  <div class="other-parents-dialog_content" tabindex="0">
    {#each adjacentItemsPropses as adjacentItemsProps}
      <AdjacentItems props={adjacentItemsProps} />
    {/each}
  </div>
</CommonDialog>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .other-parents-dialog_content {
    min-width: common.toIntegerPx(15em);
    padding: common.toIntegerPx(1em);

    display: flex;
    flex-direction: column;
    row-gap: common.toIntegerPx(0.3em);

    outline: none;

    max-height: 100%;
    overflow-y: auto;
  }
</style>
