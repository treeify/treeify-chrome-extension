import {NullaryCommand} from 'src/TreeifyWindow/Model/NullaryCommand'

/**
 * NullaryCommandとパラメータ付きUnaryCommandを「実行可能なコマンド」として統一的に扱うために導入したクラス。
 */
export class Command {
  constructor(public functionName: string, public param?: any) {}

  execute() {
    // NullaryCommandだった場合のコマンド実行
    const nullaryCommandFunction = NullaryCommand.functions[this.functionName]
    if (nullaryCommandFunction !== undefined) {
      nullaryCommandFunction()
      return
    }

    // TODO: UnaryCommandだった場合のコマンド実行
  }
}
