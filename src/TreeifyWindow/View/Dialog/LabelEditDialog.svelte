<script lang="ts">
  import {List} from 'immutable'
  import {assert, assertNonNull} from '../../../Common/Debug/assert'
  import {doWithErrorCapture} from '../../errorCapture'
  import {CurrentState} from '../../Internal/CurrentState'
  import {InputId} from '../../Internal/InputId'
  import {Rerenderer} from '../../Rerenderer'
  import CommonDialog from './CommonDialog.svelte'
  import {LabelEditDialogProps} from './LabelEditDialogProps'

  export let props: LabelEditDialogProps

  const closeDialog = () => {
    // ダイアログを閉じる
    CurrentState.setLabelEditDialog(null)
    Rerenderer.instance.rerender()
  }

  const onClickAddButton = () => {
    doWithErrorCapture(() => {
      CurrentState.setLabelEditDialog({
        labels: getAllLabelInputValues().push(''),
      })
      Rerenderer.instance.rerender()
    })
  }

  const onClickFinishButton = () => {
    doWithErrorCapture(() => {
      const labels = getAllLabelInputValues().filter((label) => label !== '')
      CurrentState.setLabels(CurrentState.getTargetItemPath(), labels)
      CurrentState.setLabelEditDialog(null)
      Rerenderer.instance.rerender()
    })
  }

  const onClickDeleteButton = (event: Event) => {
    doWithErrorCapture(() => {
      if (event.target instanceof HTMLElement) {
      } else return

      const elementNodeListOf = document.querySelectorAll('.label-edit-dialog_delete-button')
      const index = List(elementNodeListOf).indexOf(event.target)
      assert(index !== -1)
      assert(props.labels.size > 0)
      if (props.labels.size === 1) {
        // 入力欄が残り1個のときは、入力欄を0個にする代わりに空欄にする
        CurrentState.setLabelEditDialog({labels: List.of('')})
        Rerenderer.instance.rerender()
      } else {
        // 該当する入力欄を削除する
        const inputValues = getAllLabelInputValues()
        CurrentState.setLabelEditDialog({labels: inputValues.remove(index)})
        Rerenderer.instance.rerender()
      }
    })
  }

  const onKeyDown = (event: KeyboardEvent) => {
    doWithErrorCapture(() => {
      if (event.isComposing) return

      // Enterキー押下は完了ボタン押下と同じ扱いにする
      if (InputId.fromKeyboardEvent(event) === '0000Enter') {
        event.preventDefault()
        onClickFinishButton()
      }
    })
  }

  // 全てのラベル入力欄の内容テキストを返す
  function getAllLabelInputValues(): List<string> {
    const dialogDomElement = document.querySelector('.label-edit-dialog_content')
    assertNonNull(dialogDomElement)

    const inputElements = dialogDomElement.querySelectorAll('input')
    return List(inputElements).map((inputElement: HTMLInputElement) => inputElement.value)
  }
</script>

<CommonDialog title="ラベル編集" onCloseDialog={closeDialog}>
  <div class="label-edit-dialog_content">
    {#each props.labels.toArray() as label}
      <div class="label-edit-dialog_label-row">
        <input
          type="text"
          class="label-edit-dialog_label-name"
          value={label}
          on:keydown={onKeyDown}
        />
        <div class="label-edit-dialog_delete-button" on:click={onClickDeleteButton} />
      </div>
    {/each}
    <div class="label-edit-dialog_add-button" on:click={onClickAddButton} />
    <div class="label-edit-dialog_button-area">
      <button class="label-edit-dialog_finish-button" on:click={onClickFinishButton}>完了</button>
      <button class="label-edit-dialog_cancel-button" on:click={closeDialog}>キャンセル</button>
    </div>
  </div>
</CommonDialog>

<style>
  :root {
    /* 作成ボタンのサイズ（正方形の一辺の長さ） */
    --label-edit-dialog-add-button-size: 22px;

    /* 削除ボタンのサイズ（正方形の一辺の長さ） */
    --label-edit-dialog-delete-button-size: 19px;
  }

  .label-edit-dialog_content {
    padding: 1em;
  }

  .label-edit-dialog_label-row {
    display: flex;
    align-items: center;

    margin-top: 3px;

    font-size: 100%;
  }
  .label-edit-dialog_label-row:first-child {
    margin-top: 0;
  }

  .label-edit-dialog_delete-button {
    width: var(--label-edit-dialog-delete-button-size);
    height: var(--label-edit-dialog-delete-button-size);

    background: hsl(0, 0%, 40%);
    -webkit-mask: url('./trash-can-icon.svg') no-repeat center;
    -webkit-mask-size: contain;

    cursor: pointer;
  }

  .label-edit-dialog_add-button {
    width: var(--label-edit-dialog-add-button-size);
    height: var(--label-edit-dialog-add-button-size);

    margin: 3px auto;

    background: hsl(0, 0%, 35%);
    -webkit-mask: url('./plus-icon.svg') no-repeat center;
    -webkit-mask-size: contain;

    cursor: pointer;
  }

  .label-edit-dialog_button-area {
    /* 右寄せにする */
    width: max-content;
    margin-left: auto;

    margin-top: 1em;
  }
</style>
