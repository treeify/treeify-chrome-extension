<script lang="ts">
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { SyncButtonProps } from 'src/TreeifyTab/View/Toolbar/SyncButtonProps'
  import ToolbarIconButton from 'src/TreeifyTab/View/Toolbar/ToolbarIconButton.svelte'
  import { doAsync } from 'src/Utility/doAsync'

  export let props: SyncButtonProps
  let isLoading = false

  function onClick() {
    if (isLoading) return

    isLoading = true
    doAsync(async () => {
      await Command.syncTreeifyData()
      Rerenderer.instance.rerender()
    }).finally(() => {
      isLoading = false
    })
  }
</script>

{#if props.syncWith === 'Google Drive'}
  <ToolbarIconButton class="sync-button_root" title="Google Driveと同期する" on:click={onClick}>
    <div
      class="sync-button_cloud-icon"
      class:checked={!props.hasUpdatedSinceSync}
      class:disabled={isLoading}
    />
  </ToolbarIconButton>
{:else}
  <ToolbarIconButton
    class="sync-button_root"
    title={props.isDataFolderAlreadyOpened
      ? '現在のデータをデータフォルダと同期する'
      : 'データフォルダを開く'}
    on:click={onClick}
  >
    <div
      class="sync-button_data-folder-icon"
      class:already-opened={props.isDataFolderAlreadyOpened}
      class:checked={props.isDataFolderAlreadyOpened && !props.hasUpdatedSinceSync}
      class:disabled={isLoading}
    />
  </ToolbarIconButton>
{/if}

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    // データフォルダを開くボタンのアイコンの色。lch(45.0%, 0.0, 0.0)相当
    --sync-button-icon-color: #6a6a6a;

    --sync-button-icon-disabled-color: #ababab;
  }

  .sync-button_cloud-icon {
    @include common.square(24px);
    @include common.absolute-center;
    @include common.icon(var(--sync-button-icon-color), url('cloud-sync.svg'));

    &.checked {
      @include common.icon-url(url('cloud-check.svg'));
    }

    &.disabled {
      @include common.icon-color(var(--sync-button-icon-disabled-color));
    }
  }

  .sync-button_data-folder-icon {
    @include common.square(24px);
    @include common.absolute-center;
    @include common.icon(var(--sync-button-icon-color), url('folder-open.svg'));

    &.already-opened {
      @include common.icon-url(url('folder-sync.svg'));
    }

    &.checked {
      @include common.icon-url(url('folder-check.svg'));
    }

    &.disabled {
      @include common.icon-color(var(--sync-button-icon-disabled-color));
    }
  }
</style>
