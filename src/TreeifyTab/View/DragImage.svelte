<script lang="ts">
  import {ItemPath} from '../Internal/ItemPath'
  import {onItemDrop} from './dragAndDrop'
  import {DragImageProps} from './DragImageProps'
  import ItemContent from './ItemContent/ItemContent.svelte'
  import {createItemContentProps} from './ItemContent/ItemContentProps'

  export let props: DragImageProps

  $: style = `
    left: ${props.mousePosition.x}px;
    top: ${props.mousePosition.y}px;
  `

  $: itemId = ItemPath.getItemId(props.currentDragData.itemPath)
</script>

<div class="drag-image" use:onItemDrop={props.onDrop}>
  <div class="drag-image_item-image" {style}>
    <ItemContent props={createItemContentProps(itemId)} />
  </div>
</div>

<style>
  .drag-image {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 40;

    cursor: grabbing;
  }
  .drag-image_item-image {
    position: absolute;
    /* left, topはstyle属性で指定する */

    pointer-events: none;
  }
</style>
