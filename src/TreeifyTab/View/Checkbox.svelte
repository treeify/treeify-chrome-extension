<script lang="ts">
  // TODO: こういう属性転送ボイラープレートを型付きで無くせる方法が見つかったらそれを使いたい
  export let checked: boolean = false
  export let value: string | undefined = undefined
  let klass = ''
  export { klass as class }
</script>

<label class="checkbox_root {klass}">
  <input type="checkbox" class="checkbox_checkbox" {value} bind:checked />
  <slot />
</label>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .checkbox_root {
    display: flex;
    align-items: center;

    cursor: pointer;
  }

  .checkbox_checkbox {
    margin-right: common.toIntegerPx(0.3em);
  }
</style>
