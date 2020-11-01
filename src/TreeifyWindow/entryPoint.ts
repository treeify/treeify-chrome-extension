import {render} from 'lit-html'
import {createRootViewModel} from 'src/TreeifyWindow/Model/createViewModel'
import {Model} from 'src/TreeifyWindow/Model/Model'
import {RootView} from 'src/TreeifyWindow/View/RootView'

const spaRoot = document.getElementById('spa-root')!
render(RootView(createRootViewModel(Model.instance.currentState)), spaRoot)

Model.instance.addStateChangeListener((newState) => {
  render(RootView(createRootViewModel(newState)), spaRoot)
})
