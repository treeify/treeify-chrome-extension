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
    @include common.pseudo-ripple-effect(var(--circle-button-default-hover-color));
  }
</style>
