import {doWithErrorHandling} from 'src/Common/Debug/report'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {startup} from 'src/TreeifyWindow/startup'

doWithErrorHandling(() => {
  startup(Internal.createInitialState())
})
