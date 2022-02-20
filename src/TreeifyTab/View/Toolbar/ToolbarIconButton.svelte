<script lang="ts">
  let klass = ''
  export { klass as class }
  export let title = ''
</script>

<div class="toolbar-icon-button_root {klass}" {title} on:mousedown>
  <slot />
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  // ツールバーのアイコンボタンの共通クラス
  .toolbar-icon-button_root {
    @include common.circle(36px);
    // lch(90.0%, 0.0, 0.0)相当
    @include common.pseudo-ripple-effect(#e2e2e2);
  }
</style>
