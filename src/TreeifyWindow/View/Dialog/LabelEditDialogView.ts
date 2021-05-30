import {List} from 'immutable'
import {assertNonNull, assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {LabelEditDialog, State} from 'src/TreeifyWindow/Internal/State'
import {
  createButtonElement,
  createDivElement,
  createInputElement,
} from 'src/TreeifyWindow/View/createElement'
import {css} from 'src/TreeifyWindow/View/css'
import {CommonDialogView} from 'src/TreeifyWindow/View/Dialog/CommonDialogView'

export type LabelEditDialogViewModel = LabelEditDialog

export function createLabelEditDialogViewModel(state: State): LabelEditDialogViewModel | undefined {
  return state.labelEditDialog ?? undefined
}

export function LabelEditDialogView(viewModel: LabelEditDialogViewModel) {
  const onClickAddButton = () => {
    CurrentState.setLabelEditDialog({
      labels: viewModel.labels.push(''),
    })
    CurrentState.commit()
  }

  const onClickFinishButton = () => {
    const labels = viewModel.labels.filter((label) => label !== '')
    CurrentState.setLabels(CurrentState.getTargetItemPath(), labels)
    CurrentState.setLabelEditDialog(null)
    CurrentState.commit()
  }

  const closeDialog = () => {
    CurrentState.setLabelEditDialog(null)
    CurrentState.commit()
  }

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
    const labels = Internal.instance.state.labelEditDialog?.labels
    assertNonUndefined(labels)
    CurrentState.setLabelEditDialog({
      labels: labels.size > 1 ? labels.remove(index) : List.of(''),
    })
    CurrentState.commit()
  }

  return createDivElement('label-edit-dialog_label-row', {}, [
    createInputElement(
      {type: 'text', class: 'label-edit-dialog_label-name', value: text},
      {input: onInput, compositionend: reflectViewToViewModel}
    ),
    createDivElement('label-edit-dialog_delete-button', {click: onClickDeleteButton}),
  ])
}

const onInput = (event: InputEvent) => {
  if (event.isComposing) return

  reflectViewToViewModel()
}

function reflectViewToViewModel() {
  const dialogDomElement = document.querySelector('.label-edit-dialog_content')
  assertNonNull(dialogDomElement)

  const inputElements = dialogDomElement.querySelectorAll('input')
  const values = List(inputElements).map((inputElement) => inputElement.value)
  CurrentState.setLabelEditDialog({labels: values})
  CurrentState.commit()
}

export const LabelEditDialogCss = css`
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
`
