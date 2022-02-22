<script lang="ts">
  // TODO: こういう属性転送ボイラープレートを無くす方法が見つかったらそれを使いたい
  export let checked: boolean = false
  export let group: boolean[] | undefined = undefined
  export let value: string | undefined = undefined
  let klass = ''
  export { klass as class }
</script>

<label class="checkbox_root {klass}">
  <!-- groupがundefinedでも[]でも問題が起こるのでこうなる -->
  {#if group !== undefined}
    <input type="checkbox" class="checkbox_checkbox" {value} bind:checked bind:group />
  {:else}
    <input type="checkbox" class="checkbox_checkbox" {value} bind:checked />
  {/if}
  <slot />
</label>

<style global lang="scss">
  .checkbox_root {
    display: flex;
    align-items: center;

    cursor: pointer;
  }

  .checkbox_checkbox {
    margin-right: 0.3em;
  }
</style>
