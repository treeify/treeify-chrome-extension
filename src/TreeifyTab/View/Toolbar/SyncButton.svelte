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
      class:has-never-updated-after-sync={!props.hasUpdatedAfterSync}
      class:has-sync-issue={props.hasSyncIssue}
    />
  {:else}
    <LoadingIndicator size="22px" />
  {/if}
</ToolbarIconButton>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .sync-button_cloud-icon {
    @include common.size(26px);
    @include common.absolute-center;
    @include common.icon(oklch(45% 0 0), url('cloud-upload.svg'));

    &.has-never-updated-after-sync {
      @include common.icon-url(url('cloud-check.svg'));
    }

    &.has-never-synced {
      @include common.icon-url(url('cloud-sync.svg'));
    }

    &.has-sync-issue {
      @include common.icon-url(url('cloud-alert.svg'));
      @include common.icon-color(oklch(35% 70 15));
    }
  }
</style>
