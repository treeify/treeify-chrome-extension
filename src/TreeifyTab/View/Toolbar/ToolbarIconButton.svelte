<script lang="ts">
  export let title = ''
</script>

<div class="toolbar-icon-button" {title} on:click>
  <slot />
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    // ツールバーのボタンのマウスホバー時の背景。lch(90.0%, 0.0, 0.0)相当
    --toolbar-icon-button-hover-background: #e2e2e2;
  }

  // ツールバーのアイコンボタンの共通クラス
  .toolbar-icon-button {
    @include common.circle(32px);

    cursor: pointer;

    // アイコンと疑似リップルエフェクトを中央寄せにする
    position: relative;

    &:hover {
      background: var(--toolbar-icon-button-hover-background);
    }

    // ツールバーのボタンの疑似リップルエフェクトの終了状態
    &::after {
      content: '';

      @include common.circle(100%);
      @include common.absolute-center;

      opacity: 0;
      transition: opacity 0.5s, width 0.5s, height 0.5s;

      // lch(50.0%, 0.0, 0.0)相当
      background: #777777;

      pointer-events: none;
    }

    // ツールバーのボタンの疑似リップルエフェクトの開始状態
    &:active::after {
      width: 0;
      height: 0;
      opacity: 0.5;
      transition: opacity 0s, width 0s, height 0s;
    }
  }
</style>
