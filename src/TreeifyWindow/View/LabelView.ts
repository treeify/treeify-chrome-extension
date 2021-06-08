import {createElement} from 'src/TreeifyWindow/View/createElement'

export type LabelViewModel = {
  text: string
}

export function LabelView(viewModel: LabelViewModel) {
  return createElement('span', 'label', {}, [document.createTextNode(viewModel.text)])
}
