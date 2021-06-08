<script lang="ts">
  import {List} from 'immutable'
  import {ItemType} from '../../basicType'
  import {DomishObject} from '../../Internal/DomishObject'

  export type PageTreeTextContentViewModel = {
    itemType: ItemType.TEXT
    domishObjects: List<DomishObject>
  }

  export let viewModel: PageTreeTextContentViewModel
</script>

<div>{@html DomishObject.toHtml(viewModel.domishObjects)}</div>

<style>
</style>
