<script lang="ts">
  import dayjs from 'dayjs'
  import { External } from 'src/TreeifyTab/External/External'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { setupFocusTrap } from 'src/TreeifyTab/View/Dialog/focusTrap'
  import { DragAndDropLayerProps } from 'src/TreeifyTab/View/DragAndDropLayerProps'
  import ItemContent from 'src/TreeifyTab/View/ItemContent/ItemContent.svelte'
  import { createItemContentProps } from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
  import { assert, assertNonNull } from 'src/Utility/Debug/assert'
  import { dump } from 'src/Utility/Debug/logger'
  import { onMount } from 'svelte'

  export let props: DragAndDropLayerProps

  let mouseX = props.initialMousePosition.x
  let mouseY = props.initialMousePosition.y

  $: dropDestinationStyle = props.calculateDropDestinationStyle(mouseX, mouseY, props.itemPath)

  $: itemId = ItemPath.getItemId(props.itemPath)

  function onMouseMove(event: MouseEvent) {
    mouseX = event.clientX
    mouseY = event.clientY

    // TODO: ドラッグアンドドロップが無効化される不具合が直ったら削除する
    assert(External.instance.currentDragData?.type === 'ItemDragData')
  }

  // focusTrapの影響でドラッグ中はスクロールが無効化されるのでプログラムでスクロールさせる
  function onWheel(event: WheelEvent) {
    if (event.deltaY === 0) return
    event.preventDefault()

    const mainArea = document.querySelector<HTMLElement>('.main-area_root')
    assertNonNull(mainArea)
    const leftSidebar = document.querySelector<HTMLElement>('.left-sidebar_root')
    assertNonNull(leftSidebar)
    if (event.clientX < mainArea.getBoundingClientRect().left) {
      leftSidebar.scrollBy({
        top: event.deltaY,
        behavior: 'smooth',
      })
    } else {
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

    const mainArea = document.querySelector<HTMLElement>('.main-area_root')
    assertNonNull(mainArea)
    const leftSidebar = document.querySelector<HTMLElement>('.left-sidebar_root')
    assertNonNull(leftSidebar)
    leftSidebar.addEventListener('scroll', onScroll)
    mainArea.addEventListener('scroll', onScroll)
    return () => {
      leftSidebar.removeEventListener('scroll', onScroll)
      mainArea.removeEventListener('scroll', onScroll)
    }
  })

  function onMouseUp(event: MouseEvent) {
    // TODO: ドラッグアンドドロップが無効化されることがある不具合の調査用
    dump(event.type, dayjs().format('MM/DD HH:mm:ss'))

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
    <ItemContent props={createItemContentProps(itemId)} />
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --drop-destination-color: oklch(60% 0 0);
  }

  .drag-and-drop-layer_root {
    @include common.layer(40);

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

    background: oklch(100% 0 0);
    border: 1px solid oklch(90% 0 0);

    box-shadow: 0 0.5px 3px oklch(80% 0 0);

    outline: none;
  }
</style>
