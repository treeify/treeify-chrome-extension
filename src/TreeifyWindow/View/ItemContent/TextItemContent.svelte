<script lang="ts">
  import {DomishObject} from '../../Internal/DomishObject'
  import {TextItemContentViewModel} from './TextItemContentView'

  export let viewModel: TextItemContentViewModel
</script>

<div>{@html DomishObject.toHtml(viewModel.domishObjects)}</div>

<style>
</style>
