<script lang='ts'>
  import {List} from 'immutable'
  import {ItemType} from '../../basicType'
  import {DomishObject} from '../../Internal/DomishObject'
  import {TextItemContentViewModel} from './TextItemContentView'

  export type TextItemContentViewModel = {
    itemType: ItemType.TEXT
    domishObjects: List<DomishObject>
  }

  export let viewModel: TextItemContentViewModel
</script>

<div>{DomishObject.toDocumentFragment(viewModel.domishObjects)}</div>

<style>
</style>
