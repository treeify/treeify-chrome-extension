<script lang="ts">
  import {ItemPath} from '../Internal/ItemPath'
  import {DragImageProps} from './DragImageProps'
  import ItemContent from './ItemContent/ItemContent.svelte'
  import {createItemContentProps} from './ItemContent/ItemContentProps'

  export let props: DragImageProps

  $: style = `
    left: ${props.mousePosition.x}px;
    top: ${props.mousePosition.y}px;
  `

  $: itemId = ItemPath.getItemId(props.itemDragData.itemPath)
</script>

<div class="drag-image" {style}>
  <ItemContent props={createItemContentProps(itemId)} />
</div>

<style>
  .drag-image {
    position: absolute;
    z-index: 40;

    pointer-events: none;
  }
</style>
