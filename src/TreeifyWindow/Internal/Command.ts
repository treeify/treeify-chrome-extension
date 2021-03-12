import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'

export type Command = {
  functionName: string
  param?: any
}

export namespace Command {
  export function execute(command: Command) {
    // NullaryCommandだった場合のコマンド実行
    const nullaryCommandFunction = NullaryCommand.functions[command.functionName]
    if (nullaryCommandFunction !== undefined) {
      nullaryCommandFunction()
      return
    }

    // TODO: UnaryCommandだった場合のコマンド実行
  }
}
