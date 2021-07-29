<script lang="ts">
  import Cite from '../Cite.svelte'
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import {MainAreaContentView} from './MainAreaContentProps'
  import {MainAreaTableContentProps} from './MainAreaTableContentProps'

  export let props: MainAreaTableContentProps

  const id = MainAreaContentView.focusableDomElementId(props.itemPath)
</script>

<div class="main-area-table-content" {id} tabindex="0" on:focus={props.onFocus}>
  <table class="main-area-table-content_table">
    <caption class="main-area-table-content_caption">
      <ItemContent props={props.caption} />
    </caption>
    {#each props.rows.toArray() as row}
      <tr>
        {#each row.toArray() as itemContentProps}
          <td>
            <ItemContent props={itemContentProps} />
          </td>
        {/each}
      </tr>
    {/each}
  </table>
  {#if props.citeProps !== undefined}
    <Cite props={props.citeProps} />
  {/if}
</div>

<style global lang="scss">
  .main-area-table-content {
    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  .main-area-table-content_table {
    border-collapse: collapse;

    td {
      /* lch(70.0%, 0.0, 0.0) */
      border: 1px solid #ababab;

      padding-inline: 0.5em;
      padding-block: 0.2em;
    }
  }
</style>
