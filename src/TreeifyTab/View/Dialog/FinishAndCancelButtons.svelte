<script lang="ts">
  export let onClickFinishButton = () => {}
  export let onClickCancelButton = () => {}
</script>

<div class="finish-and-cancel-buttons">
  <button class="finish-and-cancel-buttons_finish-button" on:click={onClickFinishButton}
    >完了
  </button>
  <button class="finish-and-cancel-buttons_cancel-button" on:click={onClickCancelButton}
    >キャンセル
  </button>
</div>
