<script lang="ts">
  import {DomishObject} from '../../Internal/DomishObject'
  import {TextItemContentProps} from './TextItemContentProps'

  export let props: TextItemContentProps
</script>

<div>{@html DomishObject.toHtml(props.domishObjects)}</div>

<style>
</style>
