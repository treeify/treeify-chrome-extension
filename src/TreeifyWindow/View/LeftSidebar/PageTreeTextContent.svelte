<script context="module" lang="ts">
  import {get} from 'svelte/store'
  import {ItemId} from '../../basicType'
  import {Internal} from '../../Internal/Internal'

  export function createPageTreeTextContentProps(itemId: ItemId) {
    return {
      innerHtml: get(Internal.instance.state.textItems[itemId].innerHtml),
    }
  }
</script>

<script lang="ts">
  import {List} from 'immutable'
  import {DomishObject} from '../../Internal/DomishObject'

  export let innerHtml: string
</script>

<div>{@html DomishObject.toHtml(innerHtml)}</div>

<style>
</style>
