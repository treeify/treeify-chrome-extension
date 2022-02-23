<script lang="ts">
  export let size = '100%'
</script>

<div class="loading-indicator_root" style:--size={size} />

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .loading-indicator_root {
    @include common.circle(var(--size));
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    border-radius: 50%;
    border-top: 3px solid lch(30% 0 0);
    border-right: 3px solid lch(70% 0 0);
    border-bottom: 3px solid lch(70% 0 0);
    border-left: 3px solid lch(70% 0 0);
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
