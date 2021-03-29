import {Chunk, ChunkId} from 'src/TreeifyWindow/Internal/Chunk'
import {List} from 'immutable'
import {DeviceId} from 'src/TreeifyWindow/DeviceId'
import {assert} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/basicType'
import {State} from 'src/TreeifyWindow/Internal/State'

// データフォルダをルートとするファイルパス。
// "./"や"../"のような相対ファイルパスの概念はない。
// ファイルパスと言いつつフォルダもこれで表すので注意。
// 空リストはデータフォルダ自身を表す。
type FilePath = List<string>

// キーはchunk.id、値はchunk.data
type ChunkPack = {[K in ChunkId]: any}

/**
 * Treeifyのデータを格納する専用フォルダ（「データフォルダ」と呼ぶ）を管理するクラス。
 * 普通のアプリなら単一ファイルで書き出すところを、Treeifyではフォルダ内の複数ファイルに書き出す（理由は後述）。
 * さらに特殊なことに、デバイスIDごとの専用フォルダの下に書き出す（理由は後述その2）。
 * そのため複数デバイスで同じデータフォルダに書き込むと、その分だけサブフォルダが増えてデータ量が倍増する。
 *
 * 【なぜファイルではなくフォルダか】
 * 1つのファイルに全データを詰め込む形式では（APIの仕様上）差分書き込みができないのでフォルダ形式にした。
 * 大量の小さなファイルに分けて保存し、一部のファイルのみ書き換えることで差分書き込みを実現する。
 * もし差分書き込みを怠ると、自動保存機能によって1日あたり合計10GB以上ものデータが書き込まれる可能性があり、
 * SSDの寿命を縮めたりPCの動作を遅くしてしまう恐れがある。
 *
 * 【なぜデバイスごとのフォルダに保存するのか】
 * データフォルダはGoogleドライブなどのオンラインストレージでリアルタイム同期されることを想定している。
 * オンラインストレージはファイル単位で同期するので、場合によっては全体としての整合性が壊れる可能性がある。
 * そこで、自デバイス用のフォルダには他デバイスが絶対に書き込まないことで整合性を保証する。
 * そうするとデバイス間でデータが共有されないので無意味なわけだが、他デバイスフォルダから必要に応じて自デバイスフォルダに
 * データを取り込むことでデータ共有を実現する（他デバイスフォルダは自デバイス視点ではreadonly）。
 * この方式では保存データ量が倍増するが、Treeifyのデータ量は元々少ないので数倍になった程度では誤差でしかない。
 * （超ヘビーユーザーでも1デバイス分のデータ量が10MBを超えることはほぼないという試算結果が出ている）
 *
 * 【ファイル分割方針】
 * TreeifyではStateの差分書き込みのためにStateの各部分オブジェクトをChunkという単位に区切って扱う。
 * 本来ならチャンクとファイルを一対一に対応させるのが理想的な差分書き込みなのだが、
 * そうするとファイル数が膨大になってしまい、オンラインストレージによる同期速度が極端に遅くなる。
 * （Googleドライブで実測したところ500ファイルを同期するのに約1分かかる）。
 * そこで、チャンクとファイルを多対一の関係にしてファイル数を劇的に削減している。
 * このファイルのことをチャンクパックファイル(ChunkPackFile)と呼ぶ。
 */
export class DataFolder {
  constructor(private readonly dataFolderHandle: FileSystemDirectoryHandle) {}

  private static devicesFolderPath = List.of('Devices')
  private static getDeviceFolderPath(deviceId: DeviceId): FilePath {
    return this.devicesFolderPath.push(deviceId)
  }
  private static getChunkPacksFolderPath(deviceId = DeviceId.get()): FilePath {
    return this.getDeviceFolderPath(deviceId).push('ChunkPacks')
  }

  /** 選択されたフォルダ内の全ファイルを読み込んでチャンク化する */
  async readAllChunks(): Promise<List<Chunk>> {
    const fileNames = await this.getChunkFileNames(DeviceId.get())

    // 全チャンクパックファイルを読み込み
    const chunkPackPromises = fileNames.map((fileName) => this.readChunkPackFile(fileName))
    const chunkPacks = List(await Promise.all(chunkPackPromises))

    // 各チャンクパックからチャンクを取り出してList化して返却
    return chunkPacks.flatMap((chunkPack) => {
      const chunks = []
      for (const chunkId in chunkPack) {
        const chunk: Chunk = {
          id: chunkId,
          data: chunkPack[chunkId],
        }
        chunks.push(chunk)
      }
      return chunks
    })
  }

  async writeChunks(chunks: List<Chunk>) {
    // チャンクを書き込み先ファイル名によってグルーピング
    const groupByFileName = chunks.groupBy((chunk) => DataFolder.getChunkPackFileName(chunk.id))
    const chunksGroup = groupByFileName.map((collection) => collection.toList())

    const chunksFolderPath = DataFolder.getChunkPacksFolderPath()
    // 各ファイルに対して、チャンク群をまとめて書き込み
    for (const [fileName, chunks] of chunksGroup.entries()) {
      // TODO: 各ファイルへの書き込みは並列にやりたい
      const chunkPack = await this.readChunkPackFile(fileName)
      for (const chunk of chunks) {
        if (chunk.data !== undefined) {
          chunkPack[chunk.id] = chunk.data
        } else {
          // チャンクのデータがundefinedであることは、そのチャンクを削除すべきことを意味する（そういう決まり）
          delete chunkPack[chunk.id]
        }
      }

      if (Object.keys(chunkPack).length === 0) {
        // チャンクパックが空になった場合はファイルごと削除する
        const chunksFolderHandle = await this.getFolderHandle(chunksFolderPath)
        await chunksFolderHandle.removeEntry(fileName)
      } else {
        await this.writeChunkPackFile(fileName, chunkPack)
      }
    }
  }

  // 指定されたパスのフォルダハンドルを取得する。
  // 無ければ作る。
  private async getFolderHandle(
    folderPath: FilePath,
    folderHandle = this.dataFolderHandle
  ): Promise<FileSystemDirectoryHandle> {
    if (folderPath.isEmpty()) {
      return folderHandle
    }
    const directoryHandle = await folderHandle.getDirectoryHandle(folderPath.first(), {
      create: true,
    })
    return this.getFolderHandle(folderPath.shift(), directoryHandle)
  }

  // 指定されたパスのファイルハンドルを取得する。
  // 無ければ作る。
  private async getFileHandle(
    filePath: FilePath,
    folderHandle = this.dataFolderHandle
  ): Promise<FileSystemFileHandle> {
    assert(!filePath.isEmpty())
    if (filePath.size === 1) {
      return await folderHandle.getFileHandle(filePath.first(), {create: true})
    }
    const nextFolderHandle = await folderHandle.getDirectoryHandle(filePath.first(), {create: true})
    return this.getFileHandle(filePath.shift(), nextFolderHandle)
  }

  // データフォルダ内に存在する各デバイスフォルダのフォルダ名もといデバイスIDを返す
  private async getAllExistingDeviceIds(): Promise<List<DeviceId>> {
    const devicesFolder = await this.getFolderHandle(DataFolder.devicesFolderPath)
    const deviceIds = []
    for await (const deviceFolder of devicesFolder.values()) {
      if (deviceFolder.kind === 'directory') {
        deviceIds.push(deviceFolder.name)
      }
    }
    return List(deviceIds)
  }

  // 全チャンクファイルのファイル名のリストを返す
  private async getChunkFileNames(deviceId = DeviceId.get()): Promise<List<string>> {
    const chunksFolderPath = DataFolder.getChunkPacksFolderPath(deviceId)
    const chunksFolderHandle = await this.getFolderHandle(chunksFolderPath)
    const fileNames = []
    for await (const fileName of chunksFolderHandle.keys()) {
      // ファイルかどうかのチェックはしていない。
      // データフォルダを弄った場合の動作は保証しない。
      fileNames.push(fileName)
    }
    return List(fileNames)
  }

  // 指定されたファイルの最終更新日時を返す
  private async getLastModified(filePath: FilePath): Promise<integer> {
    const fileHandle = await this.getFileHandle(filePath)
    const file = await fileHandle.getFile()
    return file.lastModified
  }

  // テキストファイルの内容を上書きする。
  // ファイルが存在しない場合は作る。
  private async writeTextFile(filePath: FilePath, text: string) {
    const fileHandle = await this.getFileHandle(filePath)
    const writableFileStream = await fileHandle.createWritable()
    await writableFileStream.write(text)
    await writableFileStream.close()
  }

  // テキストファイルの内容を返す。
  // ファイルが存在しない場合は空文字列を返す。
  private async readTextFile(filePath: FilePath): Promise<string> {
    const fileHandle = await this.getFileHandle(filePath)
    const file = await fileHandle.getFile()
    return await file.text()
  }

  // チャンクパックファイルの内容を上書きする。
  // ファイルが存在しない場合は作る。
  private async writeChunkPackFile(fileName: string, chunkPack: ChunkPack) {
    const chunksFolderPath = DataFolder.getChunkPacksFolderPath()
    const filePath = chunksFolderPath.push(fileName)
    await this.writeTextFile(filePath, JSON.stringify(chunkPack, State.jsonReplacer, 2))
  }

  // チャンクパックファイルの内容を返す。
  // ファイルが存在しない場合は{}を返す。
  private async readChunkPackFile(fileName: string): Promise<ChunkPack> {
    const chunksFolderPath = DataFolder.getChunkPacksFolderPath()
    const text = await this.readTextFile(chunksFolderPath.push(fileName))
    if (text.length === 0) {
      // 空ファイル、もといそもそもファイルが存在しなかった場合
      return {}
    }
    return JSON.parse(text, State.jsonReviver)
  }

  // 各チャンクの書き込み先ファイル名を返す
  private static getChunkPackFileName(chunkId: ChunkId): string {
    const propertyPath = ChunkId.toPropertyPath(chunkId)
    const firstKey = propertyPath.first() as keyof State
    switch (firstKey) {
      case 'items':
      case 'textItems':
      case 'webPageItems':
        // チャンク数が肥大化するグループ

        const itemId = parseInt(propertyPath.get(1)!)

        /**
         * このコメント欄では1ファイルにアイテムを詰め込む個数として100を選んだ理由を説明する。
         *
         * 【SSDの寿命に与える影響の観点】
         * 1ファイルにアイテムを詰め込みすぎると書き込み量が増えてSSDの寿命が縮む。
         * itemsの1エントリーをJSON化したらサイズは平均150バイトほど。
         * textItemsの1エントリーをJSON化したらサイズは平均150バイトほど。
         * webPageItemsの1エントリーをJSON化したらサイズは平均350バイトほど。
         * よって、1つのアイテムをJSON化したらだいたい300~500バイトくらいになる。
         * 100個のアイテムを詰め込むとファイルサイズは30~50KBになる。
         *
         * 仮に1分あたり30回の書き込みが行われると仮定する（2秒に1回ペース）。
         * また、1回あたりに書き込まれるデータ量は平均50KBと仮定する（1ファイルで済む保証はないのでやや多めに見る）。
         * そうすると、もし1日の作業時間が15時間（睡眠時間などだけを除いたほぼ上限値）だとしても、
         * 合計書き込み量は1.35GBで収まる。
         * 一般に一日あたりのSSD書き込み量は10~50GBと言われているので、SSDの寿命への影響は非常に少ないと考えられる。
         *
         * 【オンラインストレージでの同期にかかる時間の観点】
         * ファイル数が多すぎるとオンラインストレージでの同期に異常な時間がかかる。
         * （変更されたファイル数が少なければ同期はすぐ終わる。なので主に新しいデバイスでの初回同期の時間が対象）
         *
         * ヘビーユーザーのアイテム数は（個人差が大きいが）1万個が1つの目安である。
         * 100アイテムを1ファイルにパッキングしたらファイル数は100個になる。
         * Googleドライブで実測したところ、500ファイルを同期するのに約1分かかった。
         * よって、アイテムが1万個あるユーザーの初回同期には約10秒かかる。
         * これはUX的には十分長い待ち時間だが、以下の理由で許容範囲内と判断した。
         * ・新しい端末を買ったときくらいしかこの待ち時間は発生しない
         * ・OSのアップデートや大きなアプリのインストールで10秒以上待たされることもよくある
         * ・そもそも大量ファイルの同期が遅いのはオンラインストレージ側の問題であり、Treeify側の問題ではない
         */
        return `items${Math.floor(itemId / 100)}.json`
      case 'pages':
      case 'availableItemIds':
      case 'maxItemId':
      case 'activePageId':
        // ミューテーションされる頻度が非常に高いグループ
        return `${firstKey}.json`
      default:
        // その他のグループ
        return `other.json`
    }
  }
}
