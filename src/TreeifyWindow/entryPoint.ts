import {doWithErrorHandling} from 'src/Common/Debug/report'
import {DeviceId} from 'src/TreeifyWindow/DeviceId'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {startup} from 'src/TreeifyWindow/startup'

doWithErrorHandling(() => {
  console.log('デバイスID = ' + DeviceId.get())
  startup(Internal.createInitialState())
})
