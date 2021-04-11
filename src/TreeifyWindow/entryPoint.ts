import {doAsyncWithErrorHandling} from 'src/Common/Debug/report'
import {DeviceId} from 'src/TreeifyWindow/DeviceId'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {startup} from 'src/TreeifyWindow/startup'

doAsyncWithErrorHandling(async () => {
  console.log('デバイスID = ' + DeviceId.get())

  await startup(Internal.createInitialState())
})
