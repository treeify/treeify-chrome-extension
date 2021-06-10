<script lang="ts">
  import {List} from 'immutable'
  import {DomishObject} from '../../Internal/DomishObject'

  export let domishObjects: List<DomishObject>
</script>

<div>{@html DomishObject.toHtml(domishObjects)}</div>

<style>
</style>
