<script lang="ts">
  import {ItemPath} from '../../Internal/ItemPath'
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import {createItemContentProps} from '../ItemContent/ItemContentProps'
  import SearchResultItem from './SearchResultItem.svelte'
  import {SearchResultItemProps} from './SearchResultItemProps'

  export let props: SearchResultItemProps
</script>

<div class="search-result-item">
  <div
    class="search-result-item_content-area"
    tabindex="0"
    on:mousedown={props.onClick}
    on:keydown={props.onKeyDown}
  >
    <ItemContent props={createItemContentProps(ItemPath.getItemId(props.itemPath))} />
  </div>
  <div class="search-result-item_indent-and-children-area">
    <div class="search-result-item_indent-area" />
    <div class="search-result-item_children-area">
      {#each props.children.toArray() as child (child.itemPath.toString())}
        <SearchResultItem props={child} />
      {/each}
    </div>
  </div>
</div>

<style global>
  .search-result-item {
    cursor: pointer;
  }

  .search-result-item_content-area:focus {
    outline: transparent;
    background: var(--main-area-focused-item-background-color);
  }
  .search-result-item_content-area:hover {
    background: var(--main-area-mouse-hover-item-background-color);
  }

  .search-result-item_indent-and-children-area {
    display: flex;
  }

  .search-result-item_indent-area {
    flex: 0 0 1.1em;
    /* lch(88.0%, 0.0, 0.0)相当 */
    border-left: 1px solid #dddddd;
  }

  .search-result-item_children-area {
    flex: 1 0;
  }
</style>
