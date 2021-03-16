import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {startup} from 'src/TreeifyWindow/startup'
import {doWithErrorHandling} from 'src/Common/Debug/report'

doWithErrorHandling(() => {
  startup(Internal.createInitialState())
})
