import {DeviceId} from 'src/TreeifyWindow/DeviceId'
import {doAsyncWithErrorHandling} from 'src/TreeifyWindow/errorCapture'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {startup} from 'src/TreeifyWindow/startup'

doAsyncWithErrorHandling(async () => {
  console.log('デバイスID = ' + DeviceId.get())

  await startup(Internal.createInitialState())
})
