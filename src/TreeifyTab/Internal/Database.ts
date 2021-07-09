import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {Chunk} from 'src/TreeifyTab/Internal/Chunk'
import {Internal} from 'src/TreeifyTab/Internal/Internal'

/**
 * Treeifyのデータを永続化するため（だけ）のデータベース（IndexedDB）。
 * Treeifyは全データをオンメモリで扱うので、通常のアプリと比べてデータベースの役割がほとんどないことに注意。
 * Treeifyタブ起動時にデータベース全体を読み込む。それ以降はデータベースを読み込まない。
 */
export namespace Database {
  let database: IDBDatabase | undefined

  const databaseName = 'Treeify'
  const chunkStoreName = 'ChunkStore'

  function getDatabase(): IDBDatabase {
    assertNonUndefined(database)
    return database
  }

  async function openDatabase(
    databaseName: string,
    newVersion: integer,
    onVersionUp: (database: IDBDatabase, oldVersion: integer) => Promise<void>
  ): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, newVersion)

      // 新規作成時またはバージョンアップ時
      request.onupgradeneeded = (event) => {
        database = request.result
        onVersionUp(database, event.oldVersion)
      }

      // 成功時
      request.onsuccess = () => {
        database = request.result
        resolve(database)
      }

      // エラー時
      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  /** データベースのスキーマバージョンに応じてマイグレーションを行う */
  export async function migrate() {
    await openDatabase(databaseName, 1, async (database, oldVersion) => {
      if (oldVersion === 0) {
        // 初回起動時

        // ObjectStoreを新規作成する
        const objectStore = database.createObjectStore(chunkStoreName, {keyPath: 'id'})

        // 初期データを投入する
        const allChunks = Chunk.createAllChunks(Internal.createInitialState())
        await Promise.all(allChunks.map((chunk) => writeChunk(chunk, objectStore)))

        // 動作確認用のサンプルOPMLデータをクリップボードに入れる
        // TODO: リリース前に削除するか、ビルドフラグを導入して分岐する
        const blob = new Blob([sampleOpml], {type: 'text/plain'})
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ])
      }
    })
  }

  /** チャンクストア内の全チャンクを読み込む */
  export async function getAllChunks(): Promise<List<Chunk>> {
    return new Promise((resolve, reject) => {
      const objectStore = getDatabase().transaction(chunkStoreName).objectStore(chunkStoreName)
      const request = objectStore.getAll()
      // 読み込みリクエスト成功時
      request.onsuccess = () => {
        const chunks: List<Chunk> = List(request.result).map(({id, data}) => {
          return {id, data: convertArrayToList(data)}
        })
        resolve(chunks)
      }
      // 読み込みリクエスト失敗時
      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  /**
   * チャンクストアにチャンクを書き込む。
   * チャンクIDが同じだった場合は上書きする。
   */
  export async function writeChunk(chunk: Chunk, givenObjectStore?: IDBObjectStore) {
    return new Promise((resolve, reject) => {
      const objectStore =
        givenObjectStore ??
        getDatabase().transaction(chunkStoreName, 'readwrite').objectStore(chunkStoreName)
      if (chunk.data !== undefined) {
      const request = objectStore.put({
        id: chunk.id,
        data: convertListToArray(chunk.data),
      })
      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = () => {
        reject(request.error)
      }
      } else {
        const request = objectStore.delete(chunk.id)
        request.onsuccess = () => {
          resolve(request.result)
        }
        request.onerror = () => {
          reject(request.error)
        }
      }
    })
  }

  // IndexedDBではImmutable.jsのList型をそのまま保存できないので一旦配列に変換する
  function convertListToArray(value: any): any {
    if (value instanceof List) {
      const list = value as List<any>
      return list.map(convertListToArray).toArray()
    }

    if (value === null) return value

    if (typeof value === 'object') {
      const mapped = Object.entries(value).map(([key, value]) => [key, convertListToArray(value)])
      return Object.fromEntries(mapped)
    }

    return value
  }

  // 与えられたJSONライクオブジェクトに含まれる配列をImmutable.jsのList型に変換する
  function convertArrayToList(value: any): any {
    if (value instanceof Array) {
      return List(value)
    }

    if (value === null) return value

    if (typeof value === 'object') {
      const mapped = Object.entries(value).map(([key, value]) => [key, convertArrayToList(value)])
      return Object.fromEntries(mapped)
    }

    return value
  }
}

const sampleOpml = `<?xml version="1.0"?>
<opml version="2.0">
  <head />
  <body>
    <outline isPage="false" itemId="3" isCollapsed="false" type="text" text="isCollapsed false">
      <outline isPage="false" itemId="4" isCollapsed="false" type="text" text="visible child" />
      <outline isPage="true" itemId="5" isCollapsed="false" type="text" text="子ページ" />
      <outline isPage="false" itemId="6" isCollapsed="false" citeTitle="Tamias - Wikipedia" citeUrl="https://en.wikipedia.org/wiki/Tamias" type="image" text="tamias" url="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Tamias_striatus2.jpg/320px-Tamias_striatus2.jpg" />
    </outline>
    <outline isPage="false" itemId="7" isCollapsed="true" type="text" text="isCollapsed true">
      <outline isPage="false" itemId="8" isCollapsed="false" cssClass="grayed-out" type="text" text="invisible child" />
    </outline>
    <outline isPage="false" itemId="9" isCollapsed="false" type="link" text="ファビコン作成 favicon.ico 無料で半透過マルチアイコンが作れます" url="https://ao-system.net/favicon/" faviconUrl="https://ao-system.net/favicon/common/image/favicon.svg" />
    <outline isPage="false" itemId="10" isCollapsed="false" type="code-block" text="const url = 'https://google.com/'&#xA;if (url.length &gt; 10 || /https:/.test(url)) {&#xA;  console.log(\`OK: \${url.length}\`)&#xA;} " language="typescript" />
  </body>
</opml>`
