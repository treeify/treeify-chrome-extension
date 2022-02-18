<script lang="ts">
  export let onClickFinishButton = () => {}
  export let onClickCancelButton = () => {}
</script>

<div class="finish-and-cancel-buttons_root">
  <button
    class="finish-and-cancel-buttons_cancel-button"
    on:mousedown|preventDefault={onClickCancelButton}
  >
    キャンセル
  </button>
  <button
    class="finish-and-cancel-buttons_finish-button"
    on:mousedown|preventDefault={onClickFinishButton}
  >
    完了
  </button>
</div>

<style global lang="scss">
  .finish-and-cancel-buttons_root {
    display: inline-flex;
    gap: 0.8em;

    [data-os-name='Windows'] & {
      flex-direction: row-reverse;
    }
  }
</style>
