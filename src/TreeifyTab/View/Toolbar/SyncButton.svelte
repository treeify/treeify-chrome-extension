<script lang="ts">
  import { GoogleDrive } from 'src/TreeifyTab/Internal/GoogleDrive'
  import LoadingIndicator from 'src/TreeifyTab/View/LoadingIndicator.svelte'
  import { SyncButtonProps } from 'src/TreeifyTab/View/Toolbar/SyncButtonProps'
  import ToolbarIconButton from 'src/TreeifyTab/View/Toolbar/ToolbarIconButton.svelte'

  export let props: SyncButtonProps

  function onClick(event: MouseEvent) {
    event.preventDefault()
    GoogleDrive.syncTreeifyData()
  }
</script>

<ToolbarIconButton class="sync-button_root" title={props.titleAttr} on:mousedown={onClick}>
  {#if !props.isInSync}
    <div
      class="sync-button_cloud-icon"
      class:has-never-synced={props.hasNeverSynced}
      class:has-updated-after-sync={!props.hasUpdatedAfterSync}
    />
  {:else}
    <LoadingIndicator size="22px" />
  {/if}
</ToolbarIconButton>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .sync-button_cloud-icon {
    @include common.square(26px);
    @include common.absolute-center;
    // lch(45.0%, 0.0, 0.0)相当
    @include common.icon(#6a6a6a, url('cloud-upload.svg'));

    &.has-updated-after-sync {
      @include common.icon-url(url('cloud-check.svg'));
    }

    &.has-never-synced {
      @include common.icon-url(url('cloud-sync.svg'));
    }
  }
</style>
