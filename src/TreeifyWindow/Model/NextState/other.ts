import {Batchizer, PropertyPath} from 'src/TreeifyWindow/Model/Batchizer'
import {Command} from 'src/TreeifyWindow/Model/Command'
import {InputId} from 'src/TreeifyWindow/Model/InputId'
import {Model} from 'src/TreeifyWindow/Model/Model'
import {NextState} from 'src/TreeifyWindow/Model/NextState/index'

export function getBatchizer(): Batchizer {
  return Model.instance.nextState
}

/** NextStateへの全ての変更を確定し、ModelのStateを書き換える */
export function commit() {
  Model.instance.commit()
}

/** アイテムツリーのInputBindingからコマンドを取得する */
export function getItemTreeCommand(inputId: InputId): Command | undefined {
  const propertyKeys = PropertyPath.of('itemTreeInputBinding', inputId)
  return NextState.getBatchizer().getDerivedValue(propertyKeys)
}
