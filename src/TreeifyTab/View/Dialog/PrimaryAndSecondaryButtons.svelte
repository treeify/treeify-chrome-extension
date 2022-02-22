<script lang="ts">
  export let primaryButtonText: string = '完了'
  export let onClickPrimaryButton = () => {}
  export let onClickSecondaryButton = () => {}
</script>

<div class="primary-and-secondary-buttons_root">
  <button
    class="primary-and-secondary-buttons_secondary-button secondary"
    on:mousedown|preventDefault={onClickSecondaryButton}
  >
    キャンセル
  </button>
  <button
    class="primary-and-secondary-buttons_primary-button primary"
    on:mousedown|preventDefault={onClickPrimaryButton}
  >
    {primaryButtonText}
  </button>
</div>

<style global lang="scss">
  .primary-and-secondary-buttons_root {
    display: inline-flex;
    gap: 0.8em;

    [data-os-name='Windows'] & {
      flex-direction: row-reverse;
    }
  }
</style>
