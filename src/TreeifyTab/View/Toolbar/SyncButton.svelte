<script lang="ts">
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { SyncButtonProps } from 'src/TreeifyTab/View/Toolbar/SyncButtonProps'
  import ToolbarIconButton from 'src/TreeifyTab/View/Toolbar/ToolbarIconButton.svelte'
  import { doAsync } from 'src/Utility/doAsync'

  export let props: SyncButtonProps

  function onClick() {
    doAsync(async () => {
      await Command.syncWithDataFolder()
      Rerenderer.instance.rerender()
    })
  }
</script>

<ToolbarIconButton
  title={props.isAlreadyOpen ? '現在のデータをデータフォルダと同期する' : 'データフォルダを開く'}
  on:click={onClick}
>
  <div
    class="sync-button_icon"
    class:already-open={props.isAlreadyOpen}
    class:completed={props.isCompleted}
  />
</ToolbarIconButton>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    // データフォルダを開くボタンのアイコンの色。lch(45.0%, 0.0, 0.0)相当
    --sync-button-icon-color: #6a6a6a;
  }

  // データフォルダアイコン
  .sync-button_icon {
    @include common.square(24px);
    @include common.absolute-center;
    @include common.icon(var(--sync-button-icon-color), url('folder-open.svg'));

    &.already-open {
      -webkit-mask: url('folder-sync.svg');
    }

    &.completed {
      -webkit-mask: url('folder-check.svg');
    }
  }
</style>
