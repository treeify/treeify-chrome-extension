<script lang="ts">
  import ItemAdditionButton from 'src/TreeifyTab/View/Toolbar/ItemAdditionButton.svelte'
  import PreferenceButton from 'src/TreeifyTab/View/Toolbar/PreferenceButton.svelte'
  import SyncButton from 'src/TreeifyTab/View/Toolbar/SyncButton.svelte'
  import { ToolbarProps } from 'src/TreeifyTab/View/Toolbar/ToolbarProps'

  export let props: ToolbarProps
</script>

<div class="toolbar_root">
  <SyncButton props={props.syncButtonProps} />
  <ItemAdditionButton />
  <PreferenceButton />
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .toolbar_root {
    height: 40px;
    padding-inline: common.toIntegerPx(2em);

    // ボタンなどを横に並べる（右寄せ）
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;

    // 左サイドバーにも影が落ちるように左サイドバーより高くする
    position: relative;
    z-index: 20;

    background: oklch(100% 0 0);
    box-shadow: 0 0 3px oklch(70% 0 0);

    @media print {
      display: none;
    }
  }
</style>
