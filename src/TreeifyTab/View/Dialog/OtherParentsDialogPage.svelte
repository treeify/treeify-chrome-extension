<script lang="ts">
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import OtherParentsDialogItem from './OtherParentsDialogItem.svelte'
  import { OtherParentsDialogPageProps } from './OtherParentsDialogPageProps'

  export let props: OtherParentsDialogPageProps
</script>

<div class="other-parents-dialog-page">
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
  .other-parents-dialog-page_page {
    display: flex;
    align-items: center;
  }

  .other-parents-dialog-page_page-icon {
    width: 1.1em;
    aspect-ratio: 1;

    // lch(30.0%, 0.0, 0.0)相当
    background: #474747;
    -webkit-mask: url('page-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }

  .other-parents-dialog-page_item-list {
    // lch(70.0%, 0.0, 0.0)相当
    border: solid 1px #ababab;
    border-radius: 0.7em;
    padding: 0.5em 0.5em 0.5em 1em;
  }
</style>
