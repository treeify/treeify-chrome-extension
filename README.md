Treeifyは大量のメモ、タブ、ブックマークをまとめてスマートに管理するブラウザ拡張機能です。  

## ビルドと動作確認の方法

事前に[Volta](https://volta.sh/)をインストールしてください。  
Voltaがインストールされている状態でこのプロジェクトのルートディレクトリで次のコマンドを実行してください。

```shell
npm install
```

`npm install`は毎回実行する必要はなく、`package.json`が変更された際に実行すれば十分です。  
`npm install`の完了後、次のコマンドでビルドしてください。  

```shell
npm run build-dev
```

ビルドに成功するとdistフォルダに成果物が出力されます。  
[Chromeの拡張機能画面](chrome://extensions/)で`パッケージ化されていない拡張機能を読み込む`ボタンを押下し、distフォルダを読み込むとTreeifyが起動します。  
このボタンはデベロッパーモード（画面右上）をONにすると表示されます。  

![デベロッパーモード](https://gyazo.com/f150bd8592d7fe774f8458dfb82d3afa.png)    

通常のChromeではなく[Dev版のChrome](https://www.google.co.jp/chrome/dev/)を追加インストールして動作確認用に使うのがおすすめです。  
