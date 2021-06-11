<script context="module" lang="ts">
  import {ItemId} from '../../basicType'
  import {Internal} from '../../Internal/Internal'

  export function createTextItemContentProps(itemId: ItemId) {
    return {
      innerHtml: Internal.instance.state.textItems[itemId].innerHtml,
    }
  }
</script>

<script lang="ts">
  import {Writable} from 'svelte/store'

  export let innerHtml: Writable<string>
</script>

<div>{@html $innerHtml}</div>

<style>
</style>
