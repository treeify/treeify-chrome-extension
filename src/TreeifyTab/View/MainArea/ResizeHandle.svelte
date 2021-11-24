<div class="resize-handle">
  <div class="resize-handle_inner" />
</div>

<style global lang="scss">
  @use 'sass:math';

  $aspectRatio: 0.16;

  // 角丸のストローク役
  .resize-handle {
    position: relative;

    // ラッパー要素に高さを指定してもらうイメージ
    height: 100%;
    // 高さが決まると自動的に幅も決まる
    aspect-ratio: $aspectRatio;

    border-radius: 99999px;
    // lch(100.0%, 0.0, 0.0)相当
    background: #ffffff;

    // lch(50.0%, 0.0, 0.0)相当
    box-shadow: 0 0 4px #777777;

    cursor: ew-resize;
  }

  // 角丸のフィル役
  .resize-handle_inner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    $strokeSize: 7%;
    height: 100% - $strokeSize;
    width: 100% - math.div($strokeSize, $aspectRatio);

    border-radius: 99999px;
    // lch(30.0%, 0.0, 0.0)相当。
    background: #474747;
  }
</style>
