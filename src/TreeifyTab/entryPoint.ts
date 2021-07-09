import {DeviceId} from 'src/TreeifyTab/DeviceId'
import {doAsyncWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {registerLanguages} from 'src/TreeifyTab/highlightJs'
import {Chunk} from 'src/TreeifyTab/Internal/Chunk'
import {Database} from 'src/TreeifyTab/Internal/Database'
import {startup} from 'src/TreeifyTab/startup'

doAsyncWithErrorCapture(async () => {
  console.log('デバイスID = ' + DeviceId.get())

  chrome.contextMenus.create({
    id: 'selection',
    title: 'Treeifyの項目として取り込み',
    contexts: ['selection'],
    type: 'normal',
  })
  window.addEventListener('unload', () => {
    chrome.contextMenus.removeAll()
  })

  registerLanguages()

  await Database.migrate()

  // データベースから読み込んでStateを初期化
  const chunks = await Database.getAllChunks()
  await startup(Chunk.inflateStateFromChunks(chunks))

  // 動作確認用のサンプルOPMLデータをクリップボードに入れる
  // TODO: リリース前に削除するか、ビルドフラグを導入して分岐する
  const blob = new Blob([sampleOpml], {type: 'text/plain'})
  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ])
})

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
