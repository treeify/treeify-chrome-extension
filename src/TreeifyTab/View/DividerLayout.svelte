<script lang="ts">
  import { RArray } from 'src/Utility/fp-ts'

  type Content = $$Generic<{}>
  export let contents: RArray<Content>

  let klass = ''
  export { klass as class }
</script>

<div class="divider-layout_root {klass}">
  {#each contents as content, i}
    {#if i > 0}
      <slot name="divider" />
    {/if}
    <slot name="content" {content} />
  {/each}
</div>
