<script lang="ts">
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import TabsDialogItem from 'src/TreeifyTab/View/Dialog/TabsDialogItem.svelte'
  import { TabsDialogProps } from 'src/TreeifyTab/View/Dialog/TabsDialogProps'

  export let props: TabsDialogProps
</script>

<CommonDialog title="タブ一覧" showCloseButton>
  <div class="tabs-dialog_content" tabindex="0">
    {#each props.items.toArray() as tabsDialogItemProps}
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
