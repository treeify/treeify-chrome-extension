<script lang="ts">
  let clientWidth = 0
</script>

<div class="resize-handle_root" style:--width="{clientWidth}px" bind:clientWidth>
  <div class="resize-handle_inner" />
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';
  @use 'sass:math';

  // 角丸のストローク役
  .resize-handle_root {
    position: relative;

    @include common.size(100%);

    border-radius: 99999px;
    background: oklch(100% 0 0);

    box-shadow: 0 0 3px oklch(70% 0 0);

    cursor: ew-resize;
  }

  // 角丸のフィル役
  .resize-handle_inner {
    @include common.absolute-center;

    @include common.size(calc(100% - var(--width) * 0.4));

    border-radius: 99999px;
    background: oklch(50% 0 0);
  }
</style>
