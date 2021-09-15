import {List} from 'immutable'
import md5 from 'md5'
import {assert, assertNonUndefined} from 'src/Common/Debug/assert'
import {Instance, InstanceId} from 'src/TreeifyTab/Instance'
import {Chunk, ChunkId} from 'src/TreeifyTab/Internal/Chunk'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {State} from 'src/TreeifyTab/Internal/State'
import {Timestamp} from 'src/TreeifyTab/Timestamp'

// データフォルダをルートとするファイルパス。
// "./"や"../"のような相対ファイルパスの概念はない。
// ファイルパスと言いつつフォルダもこれで表すので注意。
// 空リストはデータフォルダ自身を表す。
type FilePath = List<string>

// キーはchunk.id、値はchunk.data
type ChunkPack = {[K in ChunkId]: any}

// メタデータファイル内のJSONに対応する型
type Metadata = {
  timestamp: Timestamp
  // Keyはファイル名、Valueはハッシュ値
  hashes: {[K in string]: string}
  // 「このインスタンスフォルダは他インスタンスの更新をどの範囲まで把握しているか？」を表すためのデータ。
  // Keyは存在を把握している他インスタンスID、Valueは把握している最新の更新タイムスタンプ。
  known: {[K in InstanceId]: Timestamp}
}

/**
 * Treeifyのデータを格納する専用フォルダ（「データフォルダ」と呼ぶ）を管理するクラス。
 * 普通のアプリなら単一ファイルで書き出すところを、Treeifyではフォルダ内の複数ファイルに書き出す（理由は後述）。
 * さらに特殊なことに、インスタンスIDごとの専用フォルダの下に書き出す（理由は後述その2）。
 * そのため複数インスタンスで同じデータフォルダに書き込むと、その分だけサブフォルダが増えてデータ量が倍増する。
 *
 * 【なぜファイルではなくフォルダか】
 * 1つのファイルに全データを詰め込む形式では（APIの仕様上）差分書き込みができないのでフォルダ形式にした。
 * 大量の小さなファイルに分けて保存し、一部のファイルのみ書き換えることで差分書き込みを実現する。
 * もし差分書き込みを怠ると、自動保存機能によって1日あたり合計10GB以上ものデータが書き込まれる可能性があり、
 * SSDの寿命を縮めたりPCの動作を遅くしてしまう恐れがある。
 *
 * 【なぜインスタンスごとのフォルダに保存するのか】
 * データフォルダはGoogleドライブなどのオンラインストレージでリアルタイム同期されることを想定している。
 * オンラインストレージはファイル単位で同期するので、場合によっては全体としての整合性が壊れる可能性がある。
 * そこで、自インスタンス用のフォルダには他インスタンスが絶対に書き込まないことで整合性を保証する。
 * そうするとインスタンス間でデータが共有されないので無意味なわけだが、他インスタンスフォルダから必要に応じて自インスタンスフォルダに
 * データを取り込むことでデータ共有を実現する（他インスタンスフォルダは自インスタンス視点ではreadonly）。
 * この方式では保存データ量が倍増するが、Treeifyのデータ量は元々少ないので数倍になった程度では誤差でしかない。
 * （超ヘビーユーザーでも1インスタンス分のデータ量が10MBを超えることはほぼありえないという試算結果が出ている）
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

  private static instancesFolderPath = List.of('Instances')
  private static getInstanceFolderPath(instanceId = Instance.getId()): FilePath {
    return this.instancesFolderPath.push(instanceId)
  }
  private static getChunkPacksFolderPath(instanceId = Instance.getId()): FilePath {
    return this.getInstanceFolderPath(instanceId).push('ChunkPacks')
  }
  private static getChunkPackFilePath(fileName: string, instanceId = Instance.getId()): FilePath {
    return this.getChunkPacksFolderPath(instanceId).push(fileName)
  }
  private static getMetadataFilePath(instanceId = Instance.getId()): FilePath {
    return this.getInstanceFolderPath(instanceId).push('metadata.json')
  }

  /**
   * データフォルダ内のファイル内容のキャッシュ。
   * KeyはFilePathをjoin('/')した文字列。
   * Valueはファイルの内容（テキストファイルしか扱っていないのでstring型）。
   *
   * 自インスタンスフォルダ内のファイル内容しかキャッシュしない想定。
   * というのも他インスタンスのファイルは常に書き換えられる可能性があるので、キャッシュが不整合を起こすから。
   * （またそもそも他インスタンスのファイルを読み込む機会はかなり限られているので恩恵が少なすぎる）。
   *
   * このキャッシュを導入した目的は、しっかりawaitしているにも関わらず「書き込み直後に読み込むと
   * 書き込み内容が反映されていないデータが返ってくる場合がある」という問題の対策。
   */
  private fileContentCache = new Map<string, string>()
  private fetchCache(filePath: FilePath): string | undefined {
    return this.fileContentCache.get(filePath.join('/'))
  }
  private setCacheEntry(filePath: FilePath, fileContent: string) {
    this.fileContentCache.set(filePath.join('/'), fileContent)
  }
  private deleteCacheEntry(filePath: FilePath) {
    this.fileContentCache.delete(filePath.join('/'))
  }

  /** 選択されたフォルダ内の全ファイルを読み込んでチャンク化する */
  async readAllChunks(): Promise<List<Chunk>> {
    const fileNames = await this.getChunkFileNames(Instance.getId())

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

    // 各ファイルに書き込むテキストを生成。
    // チャンクパックが{}になった場合はテキストの代わりにundefinedとする。
    const fileTextPromises = List(chunksGroup.entries()).map(async ([fileName, chunks]) => {
      const chunkPack = await this.readChunkPackFile(fileName)
      for (const chunk of chunks) {
        if (chunk.data !== undefined) {
          chunkPack[chunk.id] = chunk.data
        } else {
          // チャンクのデータがundefinedであることは、そのチャンクを削除すべきことを意味する（そういう決まり）
          delete chunkPack[chunk.id]
        }
      }
      if (Object.keys(chunkPack).length > 0) {
        return {fileName, text: JSON.stringify(chunkPack, State.jsonReplacer)}
      } else {
        // チャンクパックが{}になった場合はテキストの代わりにundefinedとする。
        return {fileName, undefined}
      }
    })
    const fileTexts = await Promise.all(fileTextPromises)

    const chunksFolderHandle = await this.getFolderHandle(DataFolder.getChunkPacksFolderPath())
    // 各ファイルに並列に書き込む
    const writingPromises = fileTexts.map(async ({fileName, text}) => {
      const chunkPackFilePath = DataFolder.getChunkPackFilePath(fileName)
      if (text !== undefined) {
        this.setCacheEntry(chunkPackFilePath, text)
        await this.writeTextFile(chunkPackFilePath, text)
      } else {
        // チャンクパックが空になった場合はファイルごと削除する
        this.deleteCacheEntry(chunkPackFilePath)
        await chunksFolderHandle.removeEntry(fileName)
      }
    })
    await Promise.all(writingPromises)

    // 各ファイルのMD5を計算し、メタデータファイルを更新
    const metadata = await this.readMetadataFile()
    const hashes = metadata?.hashes ?? {}
    for (const {fileName, text} of fileTexts) {
      if (text !== undefined) {
        hashes[fileName] = md5(text)
      } else {
        delete hashes[fileName]
      }
    }
    const known = metadata?.known ?? {}
    const newMetadata: Metadata = {timestamp: Timestamp.now(), hashes, known}
    const newMetadataText = JSON.stringify(newMetadata, undefined, 2)
    const metadataFilePath = DataFolder.getMetadataFilePath()
    this.setCacheEntry(metadataFilePath, newMetadataText)
    await this.writeTextFile(metadataFilePath, newMetadataText)
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

  /**
   * 他インスタンスフォルダのデータを自インスタンスフォルダに取り込む。
   * 単純に全ファイルをコピーするだけでなく、メタデータファイルを自インスタンス視点で更新する。
   */
  async copyFrom(instanceId: InstanceId) {
    // 自インスタンスフォルダをクリア（チャンクパックファイルを全削除）
    const chunkPacksFolder = await this.getFolderHandle(DataFolder.getChunkPacksFolderPath())
    await chunkPacksFolder.removeEntry(Instance.getId(), {recursive: true})

    // 各ファイルを自インスタンスフォルダにコピーする準備
    const targetChunkPacksFolderPath = DataFolder.getChunkPacksFolderPath(instanceId)
    const targetChunkFileNames = await this.getChunkFileNames(instanceId)
    const chunkPackFileTextPromises = targetChunkFileNames.map(async (fileName) => {
      return {fileName, text: await this.readTextFile(targetChunkPacksFolderPath.push(fileName))}
    })
    const chunkPackFileTexts = await Promise.all(chunkPackFileTextPromises)

    // チャンクパックファイル群を自インスタンスフォルダに書き込み
    const chunkPackFileWritingPromises = chunkPackFileTexts.map(async ({fileName, text}) => {
      const chunkPackFilePath = DataFolder.getChunkPackFilePath(fileName)
      this.setCacheEntry(chunkPackFilePath, text)
      return await this.writeTextFile(chunkPackFilePath, text)
    })

    // メタデータファイルを更新しつつ取り込み
    const metadata = await this.readMetadataFile(instanceId)
    assertNonUndefined(metadata)
    metadata.known = await this.getAllOtherInstanceTimestamps()
    // TODO: ハッシュ値の一致チェック（本来は↑の自インスタンスフォルダのクリア前にやるのが正解）

    // メタデータファイルを自インスタンスフォルダに書き込み
    const newMetadataText = JSON.stringify(metadata, undefined, 2)
    const metadataFilePath = DataFolder.getMetadataFilePath()
    this.setCacheEntry(metadataFilePath, newMetadataText)
    const metadataFileWritingPromise = this.writeTextFile(metadataFilePath, newMetadataText)

    await Promise.all([metadataFileWritingPromise, ...chunkPackFileWritingPromises])
  }

  // データフォルダ内に存在する各インスタンスフォルダのフォルダ名もといインスタンスIDを返す
  private async getAllExistingInstanceIds(): Promise<List<InstanceId>> {
    const instancesFolder = await this.getFolderHandle(DataFolder.instancesFolderPath)
    const instanceIds = []
    for await (const instanceFolder of instancesFolder.values()) {
      if (instanceFolder.kind === 'directory') {
        instanceIds.push(instanceFolder.name)
      }
    }
    return List(instanceIds)
  }

  // 全ての他インスタンスフォルダのフォルダ名もといインスタンスIDを返す
  private async getAllOtherInstanceIds(): Promise<List<InstanceId>> {
    const instanceIds = await this.getAllExistingInstanceIds()
    return instanceIds.filter((instanceId) => instanceId !== Instance.getId())
  }

  private async getAllOtherInstanceTimestamps(): Promise<{[K in InstanceId]: Timestamp}> {
    const instanceIds = await this.getAllOtherInstanceIds()
    const timestampPromises = instanceIds.map(async (instanceId) => {
      const metadata = await this.readMetadataFile(instanceId)
      // インスタンスIDが取得できるのにメタデータファイルは取得できない状況というのは想定していない
      assertNonUndefined(metadata)
      return [instanceId, metadata.timestamp]
    })
    const entries = await Promise.all(timestampPromises)
    return Object.fromEntries(entries)
  }

  /**
   * 自インスタンスが存在を把握していないインスタンスフォルダ、または把握していない更新の行われたインスタンスフォルダのインスタンスIDを返す。
   * 複数インスタンスが該当する場合は、タイムスタンプが最も新しいものを返す。
   * 自インスタンスフォルダに何も書き込まれていない場合、タイムスタンプが最も新しいインスタンスのIDを返す。
   */
  async findUnknownUpdatedInstance(): Promise<InstanceId | undefined> {
    const metadata = await this.readMetadataFile()
    if (metadata === undefined) {
      // 自インスタンスフォルダに何も書き込まれていない場合、タイムスタンプが最も新しいインスタンスのIDを返す
      const otherInstanceTimestamps = List(
        Object.entries(await this.getAllOtherInstanceTimestamps())
      )
      const latestUpdated = otherInstanceTimestamps.maxBy(([instanceId, timestamp]) => timestamp)
      return latestUpdated?.[0]
    }

    const otherInstanceIds = await this.getAllOtherInstanceIds()
    const timestampPromises = otherInstanceIds.map(async (instanceId) => {
      const metadata = await this.readMetadataFile(instanceId)
      // インスタンスIDが取得できるのにメタデータファイルは取得できない状況というのは想定していない
      assertNonUndefined(metadata)
      return {instanceId, timestamp: metadata.timestamp}
    })

    const timestamps = await Promise.all(timestampPromises)
    const unknownUpdatedInstanceIds = timestamps.filter(({instanceId, timestamp}) => {
      const knownUpdateTimestamp = metadata.known[instanceId]
      if (knownUpdateTimestamp === undefined) {
        return true
      }
      return knownUpdateTimestamp !== timestamp
    })

    return List(unknownUpdatedInstanceIds).maxBy(({instanceId, timestamp}) => timestamp)?.instanceId
  }

  // 全チャンクファイルのファイル名のリストを返す
  private async getChunkFileNames(instanceId = Instance.getId()): Promise<List<string>> {
    const chunksFolderPath = DataFolder.getChunkPacksFolderPath(instanceId)
    const chunksFolderHandle = await this.getFolderHandle(chunksFolderPath)
    const fileNames = []
    for await (const fileName of chunksFolderHandle.keys()) {
      // ファイルかどうかのチェックはしていない。
      // データフォルダを弄った場合の動作は保証しない。
      fileNames.push(fileName)
    }
    return List(fileNames)
  }

  // テキストファイルの内容を上書きする（キャッシュは更新しない）。
  // ファイルが存在しない場合は作る。
  private async writeTextFile(filePath: FilePath, text: string) {
    const fileHandle = await this.getFileHandle(filePath)
    const writableFileStream = await fileHandle.createWritable()
    await writableFileStream.write(text)
    await writableFileStream.close()
  }

  // テキストファイルを読み込んで内容を返す（キャッシュは無視する）。
  // ファイルが存在しない場合は空文字列を返す。
  private async readTextFile(filePath: FilePath): Promise<string> {
    const fileHandle = await this.getFileHandle(filePath)
    const file = await fileHandle.getFile()
    return await file.text()
  }

  // チャンクパックファイルの内容を返す。
  // ファイルが存在しない場合は{}を返す。
  private async readChunkPackFile(fileName: string): Promise<ChunkPack> {
    const chunkPackFilePath = DataFolder.getChunkPackFilePath(fileName)
    const cachedContent = this.fetchCache(chunkPackFilePath)
    if (cachedContent === undefined) {
      const fileContent = await this.readTextFile(chunkPackFilePath)
      this.setCacheEntry(chunkPackFilePath, fileContent)

      if (fileContent.length === 0) {
        // 空ファイル、もといそもそもファイルが存在しなかった場合
        return {}
      }
      return JSON.parse(fileContent, State.jsonReviver)
    }

    if (cachedContent.length === 0) {
      // 空ファイル、もといそもそもファイルが存在しなかった場合
      return {}
    }
    return JSON.parse(cachedContent, State.jsonReviver)
  }

  // メタデータファイルの内容を返す。
  // ファイルが存在しない場合はundefinedを返す。
  private async readMetadataFile(instanceId = Instance.getId()): Promise<Metadata | undefined> {
    const metadataFilePath = DataFolder.getMetadataFilePath(instanceId)
    const cachedContent = this.fetchCache(metadataFilePath)
    if (cachedContent === undefined) {
      const fileContent = await this.readTextFile(metadataFilePath)
      if (instanceId === Instance.getId()) {
        this.setCacheEntry(metadataFilePath, fileContent)
      }

      if (fileContent.length !== 0) {
        return JSON.parse(fileContent)
      } else {
        return undefined
      }
    }

    if (cachedContent.length !== 0) {
      return JSON.parse(cachedContent)
    } else {
      return undefined
    }
  }

  // 各チャンクの書き込み先ファイル名を返す
  private static getChunkPackFileName(chunkId: ChunkId): string {
    const propertyKeys = PropertyPath.splitToPropertyKeys(chunkId)
    const firstKey = propertyKeys.first() as keyof State
    switch (firstKey) {
      case 'items':
      case 'textItems':
      case 'webPageItems':
      case 'imageItems':
      case 'codeBlockItems':
      case 'texItems':
        // チャンク数が肥大化するグループ

        const itemId = parseInt(propertyKeys.get(1)!)

        /**
         * このコメント欄では1ファイルに項目を詰め込む個数として100を選んだ理由を説明する。
         *
         * 【SSDの寿命に与える影響の観点】
         * 1ファイルに項目を詰め込みすぎると書き込み量が増えてSSDの寿命が縮む。
         * itemsの1エントリーをJSON化したらサイズは平均150バイトほど。
         * textItemsの1エントリーをJSON化したらサイズは平均150バイトほど。
         * webPageItemsの1エントリーをJSON化したらサイズは平均350バイトほど。
         * よって、1つの項目をJSON化したらだいたい300~500バイトくらいになる。
         * 100個の項目を詰め込むとファイルサイズは30~50KBになる。
         *
         * 仮に1分あたり30回の書き込みが行われると仮定する（2秒に1回ペース）。
         * また、1回あたりに書き込まれるデータ量は平均50KBと仮定する（1ファイルで済む保証はないのでやや多めに見る）。
         * そうすると、もし1日の作業時間が15時間（睡眠時間などだけを除いたほぼ上限値）だとしても、
         * 合計書き込み量は1.35GBで収まる。
         * 一般に一日あたりのSSD書き込み量は10~50GBと言われているので、SSDの寿命への影響は非常に少ないと考えられる。
         *
         * 【オンラインストレージでの同期にかかる時間の観点】
         * ファイル数が多すぎるとオンラインストレージでの同期に異常な時間がかかる。
         * （変更されたファイル数が少なければ同期はすぐ終わる。なので主に新しいインスタンスでの初回同期の時間が対象）
         *
         * ヘビーユーザーの項目数は（個人差が大きいが）1万個が1つの目安である。
         * 100項目を1ファイルにパッキングしたらファイル数は100個になる。
         * Googleドライブで実測したところ、500ファイルを同期するのに約1分かかった。
         * よって、項目が1万個あるユーザーの初回同期には約10秒かかる。
         * これはUX的には十分長い待ち時間だが、以下の理由で許容範囲内と判断した。
         * ・新しい端末を買ったときくらいしかこの待ち時間は発生しない
         * ・OSのアップデートや大きなアプリのインストールで10秒以上待たされることもよくある
         * ・そもそも大量ファイルの同期が遅いのはオンラインストレージ側の問題であり、Treeify側の問題ではない
         */
        return `items${Math.floor(itemId / 100)}.json`
      case 'pages':
      case 'mountedPageIds':
        // ミューテーションされる頻度が非常に高く、しかも同時にミューテーションされやすいグループ
        return 'unstable.json'
      case 'availableItemIds':
      case 'maxItemId':
        // ミューテーションされる頻度は高いが、同時にミューテーションされないことが多いので分けたいもの
        return `${firstKey}.json`
      default:
        // ミューテーションされる頻度が非常に低いグループ
        return 'stable.json'
    }
  }
}
