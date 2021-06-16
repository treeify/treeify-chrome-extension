<script lang="ts">
  import {DomishObject} from '../../Internal/DomishObject'
  import {PageTreeTextContentProps} from './PageTreeTextContentView'

  export let props: PageTreeTextContentProps
</script>

<div>{@html DomishObject.toHtml(props.domishObjects)}</div>

<style>
</style>
