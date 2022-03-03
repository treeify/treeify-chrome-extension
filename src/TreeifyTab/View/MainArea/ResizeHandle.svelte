<script lang="ts">
  let clientWidth = 0
</script>

<div class="resize-handle_root" style:--width="{clientWidth}px" bind:clientWidth>
  <div class="resize-handle_inner" />
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';
  @use 'sass:math';

  :root {
    --resize-handle-stroke-thickness: 0.4;
  }

  // 角丸のストローク役
  .resize-handle_root {
    position: relative;

    @include common.size(100%);

    border-radius: 99999px;
    background: lch(100% 0 0);

    box-shadow: 0 0 3px lch(70% 0 0);

    cursor: ew-resize;
  }

  // 角丸のフィル役
  .resize-handle_inner {
    @include common.absolute-center;

    @include common.size(calc(100% - var(--width) * var(--resize-handle-stroke-thickness)));

    border-radius: 99999px;
    background: lch(50% 0 0);
  }
</style>
