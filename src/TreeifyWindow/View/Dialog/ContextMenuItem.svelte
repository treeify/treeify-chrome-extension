<script lang="ts">
  import {CurrentState} from '../../Internal/CurrentState'
  import {Rerenderer} from '../../Rerenderer'
  import {ContextMenuItemProps} from './ContextMenuItemProps'

  export let props: ContextMenuItemProps

  function onClick() {
    // props.onClick()より先にダイアログを閉じる必要がある。
    // なぜならprops.onClick()内でダイアログを表示する場合があり、
    // その後にダイアログを閉じると何も起こらなくなってしまうから。
    CurrentState.setDialog(null)
    props.onClick()

    Rerenderer.instance.rerender()
  }
</script>

<div class="context-menu-item" tabindex="0" on:click={onClick}>{props.title}</div>

<style>
  .context-menu-item {
    outline: 0 solid transparent;

    font-size: 13px;

    cursor: pointer;
  }

  .context-menu-item:focus {
    background: hsl(240, 100%, 96%);
  }

  .context-menu-item:hover {
    background: hsl(240, 100%, 96%);
  }
</style>
