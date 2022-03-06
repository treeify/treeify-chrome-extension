<script lang="ts">
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import Context from 'src/TreeifyTab/View/Dialog/Context.svelte'
  import { createContextProps } from 'src/TreeifyTab/View/Dialog/ContextProps'
  import { RArray$ } from 'src/Utility/fp-ts'

  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const parentItemIds = CurrentState.getParentItemIds(targetItemId)

  const itemPaths = parentItemIds
    .flatMap((parentItemId) => [...CurrentState.yieldItemPaths(parentItemId)])
    .map(RArray$.append(targetItemId))
    .filter((itemPath) => !RArray$.shallowEqual(itemPath, targetItemPath))

  const contextPropses = itemPaths.map(createContextProps)
</script>

<CommonDialog class="other-parents-dialog_root" title="他のトランスクルード元" showCloseButton>
  <div class="other-parents-dialog_content" tabindex="0">
    {#each contextPropses as contextProps}
      <Context props={contextProps} />
    {/each}
  </div>
</CommonDialog>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .other-parents-dialog_content {
    min-width: common.em(15);
    padding: common.em(1);

    display: flex;
    flex-direction: column;
    row-gap: common.em(0.3);

    outline: none;

    max-height: 100%;
    overflow-y: auto;
  }
</style>
