<script context="module" lang="ts">
  import {get} from 'svelte/store'
  import {ItemId} from '../../basicType'
  import {Internal} from '../../Internal/Internal'

  export function createPageTreeTextContentProps(itemId: ItemId) {
    return {
      domishObjects: get(Internal.instance.state.textItems[itemId].domishObjects),
    }
  }
</script>

<script lang="ts">
  import {List} from 'immutable'
  import {DomishObject} from '../../Internal/DomishObject'

  export let domishObjects: string
</script>

<div>{@html DomishObject.toHtml(domishObjects)}</div>

<style>
</style>
