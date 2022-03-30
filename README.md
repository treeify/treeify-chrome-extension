# Treeify
Treeifyは大量のメモ、タブ、ブックマークなどをまとめてスマートに管理するChrome拡張機能です。  
[Chromeウェブストア](https://chrome.google.com/webstore/detail/treeify/jamajbdcajmklapbejkdkepajjkoblcf)からインストールできます。  

## 連絡先
[拡張機能のページ](https://chrome.google.com/webstore/detail/treeify/jamajbdcajmklapbejkdkepajjkoblcf)の**サポート**タブから質問、提案、不具合報告などを行えます。  

![](https://gyazo.com/faa85d88f2f946b0c54cbce4ea59e417.png)  

公式のTwitterアカウント[@Treeify_jp](https://twitter.com/Treeify_jp)に連絡していただいても問題ありません。  

## ビルドと動作確認の方法

手元でビルドする場合、事前に[Volta](https://volta.sh/)をインストールしてください。  
Voltaがインストールされている状態でこのプロジェクトのルートフォルダで次のコマンドを実行してください。  

```bash
npm install
```

`npm install`の完了後、次のコマンドでビルドしてください。  

```bash
npm run build-development
```

ビルドに成功すると`dist`フォルダに成果物が出力されます。  
（`npm install`の結果はキャッシュされるのでビルドごとに実行する必要はなく、`package.json`が変更された際に実行すれば十分です）  

[Chromeの拡張機能画面](chrome://extensions/)で`パッケージ化されていない拡張機能を読み込む`ボタンを押下し、`dist`フォルダを読み込むとTreeifyがインストールされます。  
このボタンはデベロッパーモード（画面右上）をONにすると表示されます。  

![デベロッパーモード](https://gyazo.com/aee41b01f08f3092d840291bc5ed536c.png)  

普段使っているTreeifyとは別にインストールして動作確認するために、Chromeに新しいプロファイルを作るか[Dev版のChrome](https://www.google.co.jp/chrome/dev/)を追加インストールするのがおすすめです。  
