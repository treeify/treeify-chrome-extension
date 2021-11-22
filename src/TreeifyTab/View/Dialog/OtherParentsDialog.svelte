<script lang="ts">
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import OtherParentsDialogPage from 'src/TreeifyTab/View/Dialog/OtherParentsDialogPage.svelte'
  import { OtherParentsDialogProps } from 'src/TreeifyTab/View/Dialog/OtherParentsDialogProps'

  export let props: OtherParentsDialogProps
</script>

<CommonDialog title="他のトランスクルード元" showCloseButton>
  <div class="other-parents-dialog_content" tabindex="0">
    {#each props.pagePropses.toArray() as pageProps}
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
