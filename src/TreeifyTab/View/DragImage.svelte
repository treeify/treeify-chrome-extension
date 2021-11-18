<script lang="ts">
  import { ItemPath } from '../Internal/ItemPath'
  import { setupFocusTrap } from './Dialog/focusTrap'
  import { onItemDrop } from './dragAndDrop'
  import { DragImageProps } from './DragImageProps'
  import ItemContent from './ItemContent/ItemContent.svelte'
  import { createItemContentProps } from './ItemContent/ItemContentProps'

  export let props: DragImageProps

  let mouseX = props.initialMousePosition.x
  let mouseY = props.initialMousePosition.y

  $: style = `
    left: ${mouseX + 8}px;
    top: ${mouseY}px;
  `
  $: dropDestinationStyle = ''

  $: itemId = ItemPath.getItemId(props.itemPath)

  function onMouseMove(event: MouseEvent) {
    mouseX = event.clientX
    mouseY = event.clientY

    dropDestinationStyle = props.calculateDropDestinationStyle(event, props.itemPath)
  }
</script>

<svelte:body on:mousemove={onMouseMove} />

<div class="drag-image" use:onItemDrop={props.onDrop} use:setupFocusTrap>
  <div class="drag-image_drop-destination" style={dropDestinationStyle} />
  <div class="drag-image_item-image" tabindex="0" {style}>
    <ItemContent props={createItemContentProps(itemId)} />
  </div>
</div>

<style global lang="scss">
  :root {
    // lch(60.0%, 0.0, 0.0)相当
    --drop-destination-color: #919191;
  }

  .drag-image {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 40;

    cursor: grabbing;
  }

  .drag-image_drop-destination {
    position: absolute;
    height: 1px;
    // left, top, widthはstyle属性で指定する

    pointer-events: none;
  }

  .drag-image_item-image {
    position: absolute;
    // left, topはstyle属性で指定する

    pointer-events: none;

    background: #ffffff;
    // lch(90.0%, 0.0, 0.0)相当
    border: 1px solid #e2e2e2;

    // lch(85.0%, 0.0, 0.0)相当
    box-shadow: 2px 2px 4px #d4d4d4;

    outline: none;
  }
</style>
