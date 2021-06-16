<script lang="ts">
  import {DomishObject} from '../../Internal/DomishObject'
  import {PageTreeTextContentViewModel} from './PageTreeTextContentView'

  export let viewModel: PageTreeTextContentViewModel
</script>

<div>{@html DomishObject.toHtml(viewModel.domishObjects)}</div>

<style>
</style>
