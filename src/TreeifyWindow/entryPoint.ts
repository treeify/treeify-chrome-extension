import {render} from 'lit-html'
import {createItemTreeRootViewModel} from 'src/TreeifyWindow/Model/createViewModel'
import {Model} from 'src/TreeifyWindow/Model/Model'
import {ItemTreeRootView} from 'src/TreeifyWindow/View/ItemTreeRootView'

const spaRoot = document.getElementById('spa-root')!
render(ItemTreeRootView(createItemTreeRootViewModel(Model.instance.currentState)), spaRoot)

Model.instance.addStateChangeListener((newState) => {
  render(ItemTreeRootView(createItemTreeRootViewModel(newState)), spaRoot)
})
