<script lang="ts">
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import { SyncButtonProps } from 'src/TreeifyTab/View/Toolbar/SyncButtonProps'
  import ToolbarIconButton from 'src/TreeifyTab/View/Toolbar/ToolbarIconButton.svelte'

  export let props: SyncButtonProps

  function onClick(event: MouseEvent) {
    event.preventDefault()
    Command.syncTreeifyData()
  }
</script>

<ToolbarIconButton class="sync-button_root" title="Google Driveと同期する" on:mousedown={onClick}>
  <div
    class="sync-button_cloud-icon"
    class:checked={!props.hasUpdatedSinceSync}
    class:disabled={props.isInSync}
  />
</ToolbarIconButton>

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
</style>
