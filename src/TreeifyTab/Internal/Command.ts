import {NullaryCommand} from 'src/TreeifyTab/Internal/NullaryCommand'

export type Command = {
  commandName: string
  parameter?: string
}

export namespace Command {
  export function execute(command: Command) {
    // NullaryCommandだった場合のコマンド実行
    const nullaryCommandFunction = NullaryCommand.functions[command.commandName]
    if (nullaryCommandFunction !== undefined) {
      nullaryCommandFunction()
      return
    }

    // TODO: UnaryCommandだった場合のコマンド実行
  }
}
