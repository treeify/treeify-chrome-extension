<script lang="ts">
  import dayjs from 'dayjs'
  import { External } from 'src/TreeifyTab/External/External'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { setupFocusTrap } from 'src/TreeifyTab/View/Dialog/focusTrap'
  import { DragAndDropLayerProps } from 'src/TreeifyTab/View/DragAndDropLayerProps'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { createItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
  import { assertNonNull } from 'src/Utility/Debug/assert'
  import { onMount } from 'svelte'

  export let props: DragAndDropLayerProps

  let mouseX = props.initialMousePosition.x
  let mouseY = props.initialMousePosition.y

  $: dropDestinationStyle = props.calculateDropDestinationStyle(mouseX, mouseY, props.itemPath)

  function onMouseMove(event: MouseEvent) {
    mouseX = event.clientX
    mouseY = event.clientY
  }

  const mainArea = document.querySelector<HTMLElement>('.main-area_root')
  assertNonNull(mainArea)

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

  function onMouseUp(event: MouseEvent) {
    console.log('onMouseUp', External.instance.currentDragData, dayjs().format('MM/DD HH:mm:ss'))
    if (External.instance.currentDragData?.type === 'ItemDragData') {
      props.onDrop(event, External.instance.currentDragData.itemPath)
      External.instance.currentDragData = undefined
      Rerenderer.instance.rerender()
    }
  }
</script>

<svelte:body on:mousemove={onMouseMove} on:mouseup|capture={onMouseUp} />

<div
  class="drag-and-drop-layer_root"
  style:--mouse-x="{mouseX}px"
  style:--mouse-y="{mouseY}px"
  use:setupFocusTrap
  on:wheel={onWheel}
>
  <div class="drag-and-drop-layer_drop-destination" style={dropDestinationStyle} />
  <div class="drag-and-drop-layer_item-image" tabindex="0">
    <ItemContent props={createItemContentProps(ItemPath.getItemId(props.itemPath))} />
  </div>
</div>

<style global lang="scss">
  :root {
    // lch(60.0%, 0.0, 0.0)相当
    --drop-destination-color: #919191;
  }

  .drag-and-drop-layer_root {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 40;

    cursor: grabbing;
  }

  .drag-and-drop-layer_drop-destination {
    position: absolute;
    height: 1px;
    // left, top, widthはstyle属性で指定する

    pointer-events: none;
  }

  .drag-and-drop-layer_item-image {
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
