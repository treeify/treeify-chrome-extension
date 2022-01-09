<script lang="ts">
  import { DataFolder } from 'src/TreeifyTab/External/DataFolder'
  import { External } from 'src/TreeifyTab/External/External'
  import { GoogleDrive } from 'src/TreeifyTab/External/GoogleDrive'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { State } from 'src/TreeifyTab/Internal/State'
  import { getSyncedAt, setSyncedAt } from 'src/TreeifyTab/Persistent/sync'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { restart } from 'src/TreeifyTab/startup'
  import { SyncButtonProps } from 'src/TreeifyTab/View/Toolbar/SyncButtonProps'
  import ToolbarIconButton from 'src/TreeifyTab/View/Toolbar/ToolbarIconButton.svelte'
  import { assertNonUndefined } from 'src/Utility/Debug/assert'
  import { dump } from 'src/Utility/Debug/logger'
  import { call } from 'src/Utility/function'
  import { compress, decompress } from 'src/Utility/gzip'
  import DataFileMataData = GoogleDrive.DataFileMataData

  export let props: SyncButtonProps
  let isLoading = false

  function onClick() {
    if (isLoading) return

    isLoading = true
    call(async () => {
      switch (Internal.instance.state.syncWith) {
        case 'Google Drive':
          await syncWithGoogleDrive()
          break
        case 'Local':
          await syncWithDataFolder()
          break
      }
      Rerenderer.instance.rerender()
    }).finally(() => {
      isLoading = false
    })
  }

  async function syncWithGoogleDrive() {
    const DATA_FILE_NAME = 'Treeify data.json.gz'

    const dataFileMetaData = await GoogleDrive.fetchDataFileMetaData()
    // TODO: リリースする前にログ出力を削除する
    dump(dataFileMetaData)
    if (dataFileMetaData === undefined) {
      // データファイルがない場合
      console.log('データファイルがない場合')

      console.log('create APIを呼んでファイル更新日時を記録して終了')
      // create APIを呼んでファイル更新日時を記録して終了
      const gzipped = await compress(JSON.stringify(Internal.instance.state))
      const response = await GoogleDrive.createFileWithMultipart(DATA_FILE_NAME, new Blob(gzipped))
      const responseJson = await response.json()
      setSyncedAt(Internal.instance.state.syncWith, responseJson.modifiedTime)
      External.instance.hasUpdatedSinceSync = false
      Rerenderer.instance.rerender()
    } else {
      // データファイルがある場合
      console.log('データファイルがある場合')

      const syncedAt = getSyncedAt(Internal.instance.state.syncWith)
      const knownTimestamp = syncedAt !== undefined ? new Date(syncedAt).getTime() : -1
      const dataFileTimestamp = new Date(dataFileMetaData.modifiedTime).getTime()
      if (knownTimestamp < dataFileTimestamp) {
        // syncedAtがundefinedであるか、データファイルの更新日時がsyncedAtより新しければ
        console.log('syncedAtがundefinedであるか、データファイルの更新日時がsyncedAtより新しければ')

        // get APIでファイル内容をダウンロードする
        const state: State = await getState(dataFileMetaData)

        // ローカルStateのmaxItemIdの方が大きい場合、ローカルStateの方が「先に進んでいる」と判断する
        dump(state.maxItemId, Internal.instance.state.maxItemId)
        if (state.maxItemId < Internal.instance.state.maxItemId) {
          const gzipped = await compress(JSON.stringify(Internal.instance.state))
          const response = await GoogleDrive.updateFileWithMultipart(
            dataFileMetaData.id,
            new Blob(gzipped)
          )
          const responseJson = await response.json()
          setSyncedAt(Internal.instance.state.syncWith, responseJson.modifiedTime)
          External.instance.hasUpdatedSinceSync = false
          Rerenderer.instance.rerender()
        } else {
          setSyncedAt(Internal.instance.state.syncWith, dataFileMetaData.modifiedTime)
          await restart(state, syncedAt === undefined)
        }
      } else if (knownTimestamp > dataFileTimestamp) {
        // ユーザーがデータファイルをロールバックさせた場合くらいしか到達しない特殊なケース
        console.log('例外的な状況でしか到達できない特殊なケース')

        const state: State = await getState(dataFileMetaData)
        setSyncedAt(Internal.instance.state.syncWith, dataFileMetaData.modifiedTime)
        await restart(state)
      } else {
        // データファイルの更新日時がsyncedAtと等しければ
        console.log('データファイルの更新日時がsyncedAtと等しければ')

        // ローカルStateが更新されていないならupdate APIを呼ぶ必要はない
        if (!External.instance.hasUpdatedSinceSync) return

        const gzipped = await compress(JSON.stringify(Internal.instance.state))
        const response = await GoogleDrive.updateFileWithMultipart(
          dataFileMetaData.id,
          new Blob(gzipped)
        )
        const responseJson = await response.json()
        setSyncedAt(Internal.instance.state.syncWith, responseJson.modifiedTime)
        External.instance.hasUpdatedSinceSync = false
        Rerenderer.instance.rerender()
      }
    }
  }

  async function getState(metaData: DataFileMataData): Promise<State> {
    if (External.instance.backgroundDownload?.modifiedTime === metaData.modifiedTime) {
      const promise = External.instance.backgroundDownload.promise
      External.instance.backgroundDownload = undefined
      return await promise
    }

    const response = await GoogleDrive.readFile(metaData.id)
    const text = await decompress(await response.arrayBuffer())
    return JSON.parse(text)
  }

  /**
   * オンメモリのStateとデータフォルダ内のStateを同期する（状況に応じて読み込みや書き込みを行う）。
   * もしデータフォルダがまだ開かれていない場合はデータフォルダを開くプロセスを開始する。
   */
  async function syncWithDataFolder() {
    try {
      const hadNotOpenedDataFolder = External.instance.dataFolder === undefined
      if (hadNotOpenedDataFolder) {
        const folderHandle = await showDirectoryPicker()
        await folderHandle.requestPermission({ mode: 'readwrite' })
        External.instance.dataFolder = new DataFolder(folderHandle)
      }
      assertNonUndefined(External.instance.dataFolder)

      const lastModified = await External.instance.dataFolder.fetchLastModified()
      if (lastModified === undefined) {
        // データファイルがない場合

        const lastModified = await External.instance.dataFolder.writeState(Internal.instance.state)
        setSyncedAt(Internal.instance.state.syncWith, lastModified.toString())
        External.instance.hasUpdatedSinceSync = false
        Rerenderer.instance.rerender()
      } else {
        // データファイルがある場合

        const syncedAt = getSyncedAt(Internal.instance.state.syncWith)
        const knownTimestamp = syncedAt !== undefined ? parseInt(syncedAt) : -1
        if (knownTimestamp < lastModified) {
          // syncedAtがundefinedであるか、データファイルの更新日時がsyncedAtより新しければ
          console.log(
            'syncedAtがundefinedであるか、データファイルの更新日時がsyncedAtより新しければ'
          )

          const state = await External.instance.dataFolder.readState()
          assertNonUndefined(state)

          // ローカルStateのmaxItemIdの方が大きい場合、ローカルStateの方が「先に進んでいる」と判断する
          dump(state.maxItemId, Internal.instance.state.maxItemId)
          if (state.maxItemId < Internal.instance.state.maxItemId) {
            const lastModified = await External.instance.dataFolder.writeState(
              Internal.instance.state
            )
            setSyncedAt(Internal.instance.state.syncWith, lastModified.toString())
            External.instance.hasUpdatedSinceSync = false
            Rerenderer.instance.rerender()
          } else {
            setSyncedAt(Internal.instance.state.syncWith, lastModified.toString())
            await restart(state, syncedAt === undefined)
          }
        } else if (knownTimestamp > lastModified) {
          // ユーザーがデータファイルをロールバックさせた場合くらいしか到達しない特殊なケース
          console.log('例外的な状況でしか到達できない特殊なケース')

          const state = await External.instance.dataFolder.readState()
          assertNonUndefined(state)
          setSyncedAt(Internal.instance.state.syncWith, lastModified.toString())
          await restart(state)
        } else {
          // データファイルの更新日時がsyncedAtと等しければ
          console.log('データファイルの更新日時がsyncedAtと等しければ')

          // ローカルStateが更新されていないならupdate APIを呼ぶ必要はない
          if (!External.instance.hasUpdatedSinceSync) return

          const lastModified = await External.instance.dataFolder.writeState(
            Internal.instance.state
          )
          setSyncedAt(Internal.instance.state.syncWith, lastModified.toString())
          External.instance.hasUpdatedSinceSync = false
          Rerenderer.instance.rerender()
        }
      }
    } catch (e) {
      // 何も選ばずピッカーを閉じた際、エラーアラートを出さないようにする
      if (e instanceof Error && e.name === 'AbortError') return

      throw e
    }
  }
</script>

{#if props.syncWith === 'Google Drive'}
  <ToolbarIconButton class="sync-button_root" title="Google Driveと同期する" on:click={onClick}>
    <div
      class="sync-button_cloud-icon"
      class:checked={!props.hasUpdatedSinceSync}
      class:disabled={isLoading}
    />
  </ToolbarIconButton>
{:else}
  <ToolbarIconButton
    class="sync-button_root"
    title={props.isDataFolderAlreadyOpened
      ? '現在のデータをデータフォルダと同期する'
      : 'データフォルダを開く'}
    on:click={onClick}
  >
    <div
      class="sync-button_data-folder-icon"
      class:already-opened={props.isDataFolderAlreadyOpened}
      class:checked={props.isDataFolderAlreadyOpened && !props.hasUpdatedSinceSync}
      class:disabled={isLoading}
    />
  </ToolbarIconButton>
{/if}

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    // データフォルダを開くボタンのアイコンの色。lch(45.0%, 0.0, 0.0)相当
    --sync-button-icon-color: #6a6a6a;

    --sync-button-icon-disabled-color: #ababab;
  }

  .sync-button_cloud-icon {
    @include common.square(24px);
    @include common.absolute-center;
    @include common.icon(var(--sync-button-icon-color), url('cloud-sync.svg'));

    &.checked {
      @include common.icon-url(url('cloud-check.svg'));
    }

    &.disabled {
      @include common.icon-color(var(--sync-button-icon-disabled-color));
    }
  }

  .sync-button_data-folder-icon {
    @include common.square(24px);
    @include common.absolute-center;
    @include common.icon(var(--sync-button-icon-color), url('folder-open.svg'));

    &.already-opened {
      @include common.icon-url(url('folder-sync.svg'));
    }

    &.checked {
      @include common.icon-url(url('folder-check.svg'));
    }

    &.disabled {
      @include common.icon-color(var(--sync-button-icon-disabled-color));
    }
  }
</style>
