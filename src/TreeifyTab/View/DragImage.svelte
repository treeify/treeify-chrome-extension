<script lang="ts">
  import {ItemPath} from '../Internal/ItemPath'
  import {onItemDrop} from './dragAndDrop'
  import {DragImageProps} from './DragImageProps'
  import ItemContent from './ItemContent/ItemContent.svelte'
  import {createItemContentProps} from './ItemContent/ItemContentProps'

  export let props: DragImageProps

  let mouseX = props.initialMousePosition.x
  let mouseY = props.initialMousePosition.y

  $: style = `
    left: ${mouseX + 8}px;
    top: ${mouseY}px;
  `

  $: itemId = ItemPath.getItemId(props.itemPath)

  function onMouseMove(event: MouseEvent) {
    $: mouseX = event.clientX
    $: mouseY = event.clientY
  }
</script>

<svelte:body on:mousemove={onMouseMove} />

<div class="drag-image" use:onItemDrop={props.onDrop}>
  <div class="drag-image_item-image" {style}>
    <ItemContent props={createItemContentProps(itemId)} />
  </div>
</div>

<style global lang="scss">
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

    background: #ffffff;
    /* lch(90.0%, 0.0, 0.0)相当 */
    border: 1px solid #e2e2e2;
  }
</style>
