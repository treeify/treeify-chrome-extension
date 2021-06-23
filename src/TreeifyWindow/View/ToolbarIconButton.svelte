<script lang="ts">
</script>

<div class="toolbar-icon-button" on:click>
  <slot />
</div>

<style>
  :root {
    /* ツールバーのボタンのサイズ（正方形の一辺の長さ） */
    --toolbar-icon-button-size: 32px;
    /* ツールバーのボタンのマウスホバー時の背景 */
    --toolbar-icon-button-hover-background: hsl(0, 0%, 90%);
  }

  /* ツールバーのアイコンボタンの共通クラス */
  .toolbar-icon-button {
    width: var(--toolbar-icon-button-size);
    height: var(--toolbar-icon-button-size);
    border-radius: 50%;

    cursor: pointer;

    /* アイコンと疑似リップルエフェクトを中央寄せにする */
    position: relative;
  }
  .toolbar-icon-button:hover {
    background: var(--toolbar-icon-button-hover-background);
  }
  /* ツールバーのボタンの疑似リップルエフェクトの終了状態 */
  .toolbar-icon-button::after {
    content: '';

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s, width 0.5s, height 0.5s;

    border-radius: 50%;

    background: hsl(0, 0%, 50%);
  }
  /* ツールバーのボタンの疑似リップルエフェクトの開始状態 */
  .toolbar-icon-button:active::after {
    width: 0;
    height: 0;
    opacity: 0.5;
    transition: opacity 0s, width 0s, height 0s;
  }
</style>
