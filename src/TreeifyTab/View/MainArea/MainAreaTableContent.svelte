<script lang="ts">
  import Cite from '../Cite.svelte'
  import {MainAreaContentView} from './MainAreaContentProps'
  import {MainAreaTableContentProps} from './MainAreaTableContentProps'

  export let props: MainAreaTableContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-table-content" {id} tabindex="0" on:focus={props.onFocus}>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style global>
  .main-area-table-content {
    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }
</style>
