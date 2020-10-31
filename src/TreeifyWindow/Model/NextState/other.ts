import {Batchizer, Mutation, PropertyPath} from 'src/TreeifyWindow/Model/Batchizer'
import {Model} from 'src/TreeifyWindow/Model/Model'

export function getBatchizer(): Batchizer {
  return Model.instance.nextState
}

/** NextStateへの全ての変更を確定し、ModelのStateを書き換える */
export function commit() {
  Model.instance.commit()
}
