<script lang="ts">
  import {List} from 'immutable'
  import {ItemType} from '../../basicType'
  import {DomishObject} from '../../Internal/DomishObject'

  type TextItemContentViewModel = {
    itemType: ItemType.TEXT
    domishObjects: List<DomishObject>
  }

  export let viewModel: TextItemContentViewModel
</script>

<div>{@html DomishObject.toHtml(viewModel.domishObjects)}</div>

<style>
</style>
