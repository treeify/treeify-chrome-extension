<script lang="ts">
  import {DomishObject} from '../../Internal/DomishObject'
  import {TextItemContentProps} from './TextItemContentProps'

  export let props: TextItemContentProps
</script>

<div class="text-item-content">{@html DomishObject.toHtml(props.domishObjects)}</div>

<style global lang="scss">
</style>
