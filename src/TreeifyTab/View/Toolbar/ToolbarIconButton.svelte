<script lang="ts">
  let klass = ''
  export { klass as class }
  export let title = ''
</script>

<div class="toolbar-icon-button_root {klass}" {title} on:click>
  <slot />
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    // ツールバーのボタンのマウスホバー時の背景。lch(90.0%, 0.0, 0.0)相当
    --toolbar-icon-button-hover-background: #e2e2e2;
  }

  // ツールバーのアイコンボタンの共通クラス
  .toolbar-icon-button_root {
    @include common.circle(32px);
    @include common.pseudo-ripple-effect(var(--toolbar-icon-button-hover-background));
  }
</style>
