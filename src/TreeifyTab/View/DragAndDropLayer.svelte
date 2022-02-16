<script lang="ts">
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { setupFocusTrap } from 'src/TreeifyTab/View/Dialog/focusTrap'
  import { onItemDrop } from 'src/TreeifyTab/View/dragAndDrop'
  import { DragAndDropLayerProps } from 'src/TreeifyTab/View/DragAndDropLayerProps'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { createItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
  import { assertNonNull } from 'src/Utility/Debug/assert'
  import { onMount } from 'svelte'

  export let props: DragAndDropLayerProps

  let mouseX = props.initialMousePosition.x
  let mouseY = props.initialMousePosition.y

  $: dropDestinationStyle = props.calculateDropDestinationStyle(mouseX, mouseY, props.itemPath)

  $: itemId = ItemPath.getItemId(props.itemPath)

  function onMouseMove(event: MouseEvent) {
    mouseX = event.clientX
    mouseY = event.clientY
  }

  const mainArea = document.querySelector<HTMLElement>('.main-area_root')
  assertNonNull<HTMLElement>(mainArea)

  // focusTrapの影響でドラッグ中はスクロールが無効化されるのでプログラムでスクロールさせる
  function onWheel(event: WheelEvent) {
    if (event.deltaY !== 0) {
      // TODO: メインエリアだけでなく左サイドバーもスクロールできるよう分岐を追加する
      mainArea.scrollBy({
        top: event.deltaY,
        behavior: 'smooth',
      })
    }
  }

  onMount(() => {
    function onScroll(event: Event) {
      dropDestinationStyle = props.calculateDropDestinationStyle(mouseX, mouseY, props.itemPath)
    }

    mainArea.addEventListener('scroll', onScroll)
    return () => mainArea.removeEventListener('scroll', onScroll)
  })
</script>

<svelte:body on:mousemove={onMouseMove} />

<div
  class="drag-image_root"
  style:--mouse-x="{mouseX}px"
  style:--mouse-y="{mouseY}px"
  use:onItemDrop={props.onDrop}
  use:setupFocusTrap
  on:wheel={onWheel}
>
  <div class="drag-image_drop-destination" style={dropDestinationStyle} />
  <div class="drag-image_item-image" tabindex="0">
    <ItemContent props={createItemContentProps(itemId)} />
  </div>
</div>

<style global lang="scss">
  :root {
    // lch(60.0%, 0.0, 0.0)相当
    --drop-destination-color: #919191;
  }

  .drag-image_root {
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
    left: calc(var(--mouse-x) + 8px);
    top: var(--mouse-y);

    max-width: var(--main-area-max-width);

    pointer-events: none;

    background: #ffffff;
    // lch(90.0%, 0.0, 0.0)相当
    border: 1px solid #e2e2e2;

    // lch(85.0%, 0.0, 0.0)相当
    box-shadow: 2px 2px 4px #d4d4d4;

    outline: none;
  }
</style>
