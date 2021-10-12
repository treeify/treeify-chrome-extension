<script lang="ts">
  import CommonDialog from './CommonDialog.svelte'
  import TabsDialogItem from './TabsDialogItem.svelte'
  import {TabsDialogProps} from './TabsDialogProps'

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
  }
</style>
