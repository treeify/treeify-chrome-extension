<script lang="ts">
  export let title = ''
</script>

<div class="toolbar-icon-button" {title} on:click>
  <slot />
</div>

<style global lang="scss">
  :root {
    // ツールバーのボタンのマウスホバー時の背景。lch(90.0%, 0.0, 0.0)相当
    --toolbar-icon-button-hover-background: #e2e2e2;
  }

  // ツールバーのアイコンボタンの共通クラス
  .toolbar-icon-button {
    --button-size: 32px;
    width: var(--button-size);
    height: var(--button-size);
    border-radius: 50%;

    cursor: pointer;

    // アイコンと疑似リップルエフェクトを中央寄せにする
    position: relative;

    &:hover {
      background: var(--toolbar-icon-button-hover-background);
    }

    // ツールバーのボタンの疑似リップルエフェクトの終了状態
    &::after {
      content: '';

      // 中央寄せ
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.5s, width 0.5s, height 0.5s;

      border-radius: 50%;

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
