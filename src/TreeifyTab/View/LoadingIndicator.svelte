<script lang="ts">
  export let size = '100%'
</script>

<div class="loading-indicator_root" style:--size={size} />

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --loading-indicator-thickness: 3px;
    --loading-indicator-secondary-color: oklch(70% 0 0);
  }

  .loading-indicator_root {
    @include common.circle(var(--size));
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    border-top: var(--loading-indicator-thickness) solid oklch(30% 0 0);
    border-right: var(--loading-indicator-thickness) solid var(--loading-indicator-secondary-color);
    border-bottom: var(--loading-indicator-thickness) solid var(--loading-indicator-secondary-color);
    border-left: var(--loading-indicator-thickness) solid var(--loading-indicator-secondary-color);
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
