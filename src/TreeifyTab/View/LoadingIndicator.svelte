<div class="loading-indicator_root" />

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .loading-indicator_root {
    @include common.circle(100%);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    border-radius: 50%;
    // lch(30.0%, 0.0, 0.0)相当
    border-top: 3px solid #474747;
    // lch(70.0%, 0.0, 0.0)相当
    border-right: 3px solid #ababab;
    border-bottom: 3px solid #ababab;
    border-left: 3px solid #ababab;
    animation: rotation 0.8s infinite linear;
  }

  @keyframes rotation {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
</style>
