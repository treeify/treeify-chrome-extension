<script context="module" lang="ts">
  import {CurrentState} from '../../Internal/CurrentState'
  import {Internal} from 'src/TreeifyWindow/Internal/Internal'

  export function createLabelEditDialogProps() {
    if (Internal.instance.state.labelEditDialog === null) return undefined

    const labels = CurrentState.getLabels(CurrentState.getTargetItemPath())
    if (labels.isEmpty()) {
      // 空の入力欄を1つ表示するよう設定する（入力欄が0個だと見た目が奇妙だしわざわざ+ボタンを押すのが面倒）
      return {labels: ['']}
    } else {
      return {labels: labels.toArray()}
    }
  }
</script>

<script lang="ts">
  import {List} from 'immutable'
  import {doWithErrorCapture} from '../../errorCapture'
  import {InputId} from '../../Internal/InputId'
  import CommonDialog from './CommonDialog.svelte'

  export let labels: string[]

  const closeDialog = () => {
    // ダイアログを閉じる
    CurrentState.setLabelEditDialog(null)
    CurrentState.commit()
  }

  const onClickAddButton = () => {
    doWithErrorCapture(() => {
      labels.push('')
      labels = labels
    })
  }

  const onClickFinishButton = () => {
    doWithErrorCapture(() => {
      const nonEmptyLabels = labels.filter((label) => label !== '')
      CurrentState.setLabels(CurrentState.getTargetItemPath(), List(nonEmptyLabels))
      CurrentState.setLabelEditDialog(null)
      CurrentState.commit()
    })
  }

  const onClickDeleteButton = () => {
    doWithErrorCapture(() => {
      throw new Error('TODO: 未移植。indexの取得方法を検討中')
      // const values = getAllLabelInputValues()
      // CurrentState.setLabelEditDialog({
      //   labels: values.size > 1 ? values.remove(index) : List.of(''),
      // })
      // CurrentState.commit()
    })
  }

  const onKeyDown = (event: KeyboardEvent) => {
    doWithErrorCapture(() => {
      if (event.isComposing) return

      // Enterキー押下は完了ボタン押下と同じ扱いにする
      if (InputId.fromKeyboardEvent(event) === '0000Enter') {
        onClickFinishButton()
      }
    })
  }
</script>

<CommonDialog title="ラベル編集" onCloseDialog={closeDialog}>
  <div class="label-edit-dialog_content">
    {#each labels as label}
      <div class="label-edit-dialog_label-row">
        <input
          type="text"
          class="label-edit-dialog_label-name"
          bind:value={label}
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
