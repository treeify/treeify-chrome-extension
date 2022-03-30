<script lang="ts">
  export let group: string = ''
  export let value: string = ''
</script>

<label class="radio-button_root">
  <input type="radio" class="radio-button_radio-button" bind:group {value} />
  <slot />
</label>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .radio-button_root {
    display: inline-flex;
    align-items: center;
    gap: common.toIntegerPx(0.3em);

    cursor: pointer;
  }

  .radio-button_radio-button {
    margin: 0;
  }
</style>
