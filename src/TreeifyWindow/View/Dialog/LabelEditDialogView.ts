import {List} from 'immutable'
import {assertNonNull} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {LabelEditDialog, State} from 'src/TreeifyWindow/Internal/State'
import {
  createButtonElement,
  createDivElement,
  createInputElement,
} from 'src/TreeifyWindow/View/createElement'
import {CommonDialogView} from 'src/TreeifyWindow/View/Dialog/CommonDialogView'

export type LabelEditDialogViewModel = LabelEditDialog

export function createLabelEditDialogViewModel(state: State): LabelEditDialogViewModel | undefined {
  return state.labelEditDialog ?? undefined
}

export function LabelEditDialogView(viewModel: LabelEditDialogViewModel) {
  return CommonDialogView({
    title: 'ラベル編集',
    content: createDivElement(
      'label-edit-dialog_content',
      {},
      viewModel.labels
        .map(createLabelRow)
        .push(
          createDivElement('label-edit-dialog_add-button', {click: onClickAddButton}),
          createDivElement('label-edit-dialog_button-area', {}, [
            createButtonElement(
              'label-edit-dialog_finish-button',
              {click: onClickFinishButton},
              '完了'
            ),
            createButtonElement(
              'label-edit-dialog_cancel-button',
              {click: closeDialog},
              'キャンセル'
            ),
          ])
        )
    ),
    onCloseDialog: closeDialog,
  })
}

function createLabelRow(text: string, index: integer) {
  const onClickDeleteButton = () => {
    doWithErrorCapture(() => {
      const values = getAllLabelInputValues()
      CurrentState.setLabelEditDialog({
        labels: values.size > 1 ? values.remove(index) : List.of(''),
      })
      CurrentState.commit()
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

  return createDivElement('label-edit-dialog_label-row', {}, [
    createInputElement(
      {type: 'text', class: 'label-edit-dialog_label-name', value: text},
      {keydown: onKeyDown}
    ),
    createDivElement('label-edit-dialog_delete-button', {click: onClickDeleteButton}),
  ])
}

const onClickAddButton = () => {
  doWithErrorCapture(() => {
    CurrentState.setLabelEditDialog({
      labels: getAllLabelInputValues().push(''),
    })
    CurrentState.commit()
  })
}

const onClickFinishButton = () => {
  doWithErrorCapture(() => {
    const labels = getAllLabelInputValues().filter((label) => label !== '')
    CurrentState.setLabels(CurrentState.getTargetItemPath(), labels)
    CurrentState.setLabelEditDialog(null)
    CurrentState.commit()
  })
}

const closeDialog = () => {
  doWithErrorCapture(() => {
    CurrentState.setLabelEditDialog(null)
    CurrentState.commit()
  })
}

// 全てのラベル入力欄の内容テキストを返す
function getAllLabelInputValues(): List<string> {
  const dialogDomElement = document.querySelector('.label-edit-dialog_content')
  assertNonNull(dialogDomElement)

  const inputElements = dialogDomElement.querySelectorAll('input')
  return List(inputElements).map((inputElement) => inputElement.value)
}
