/*
このファイルは、データフォルダのファイル書き込みを代行するWeb Workerのエントリーポイント。

【Web Workerを使っている理由】
UIスレッドでファイル書き込みを行うと、Windowsではマウスポインターがprogress状態になる。
Treeifyでは自動保存機能によって細かく頻繁に書き込むので、マウスポインターがチカチカしてしまう。
それを防ぐためWeb Workerに書き込ませる。
*/

// Window型ではなくWorker型として無理やり認識させる
const selfWorker: Worker = self as any

type Message = {
  fileHandle: FileSystemFileHandle
  text: string
}

selfWorker.addEventListener(
  'message',
  async (event) => {
    const message = event.data as Message

    const writableFileStream = await message.fileHandle.createWritable()
    await writableFileStream.write(message.text)
    await writableFileStream.close()

    selfWorker.postMessage('finish')

    // このWeb Workerは常駐せず終了するタイプ
    close()
  },
  {once: true}
)
