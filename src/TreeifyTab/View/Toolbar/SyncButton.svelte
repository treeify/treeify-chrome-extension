<script lang="ts">
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import LoadingIndicator from 'src/TreeifyTab/View/LoadingIndicator.svelte'
  import { SyncButtonProps } from 'src/TreeifyTab/View/Toolbar/SyncButtonProps'
  import ToolbarIconButton from 'src/TreeifyTab/View/Toolbar/ToolbarIconButton.svelte'

  export let props: SyncButtonProps

  function onClick(event: MouseEvent) {
    event.preventDefault()
    Command.syncTreeifyData()
  }
</script>

<ToolbarIconButton class="sync-button_root" title="Google Driveと同期する" on:mousedown={onClick}>
  {#if !props.isInSync}
    <div
      class="sync-button_cloud-icon"
      class:has-never-synced={props.hasNeverSynced}
      class:has-updated-after-sync={!props.hasUpdatedAfterSync}
    />
  {:else}
    <LoadingIndicator size="24px" />
  {/if}
</ToolbarIconButton>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    // lch(45.0%, 0.0, 0.0)相当
    --sync-button-icon-color: #6a6a6a;
  }

  .sync-button_cloud-icon {
    @include common.square(24px);
    @include common.absolute-center;
    @include common.icon(var(--sync-button-icon-color), url('cloud-upload.svg'));

    &.has-updated-after-sync {
      @include common.icon-url(url('cloud-check.svg'));
    }

    &.has-never-synced {
      @include common.icon-url(url('cloud-sync.svg'));
    }
  }
</style>
