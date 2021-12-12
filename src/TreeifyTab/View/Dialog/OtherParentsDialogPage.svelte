<script lang="ts">
  import OtherParentsDialogItem from 'src/TreeifyTab/View/Dialog/OtherParentsDialogItem.svelte'
  import { OtherParentsDialogPageProps } from 'src/TreeifyTab/View/Dialog/OtherParentsDialogPageProps'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'

  export let props: OtherParentsDialogPageProps
</script>

<div class="other-parents-dialog-page_root">
  <div class="other-parents-dialog-page_page">
    <div class="other-parents-dialog-page_page-icon" />
    <ItemContent props={props.pageContentProps} />
  </div>
  <div class="other-parents-dialog-page_item-list">
    {#each props.itemPropses.toArray() as itemProps}
      <OtherParentsDialogItem props={itemProps} />
    {/each}
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .other-parents-dialog-page_page {
    display: flex;
    align-items: center;
  }

  .other-parents-dialog-page_page-icon {
    @include common.square(1.1em);

    // lch(30.0%, 0.0, 0.0)相当
    @include common.icon(#474747, url('page.svg'));
  }

  .other-parents-dialog-page_item-list {
    // lch(70.0%, 0.0, 0.0)相当
    border: solid 1px #ababab;
    border-radius: 0.7em;
    padding: 0.5em 0.5em 0.5em 1em;
  }
</style>
