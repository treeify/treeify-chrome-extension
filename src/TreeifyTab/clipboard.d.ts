export {}

// なぜかどのnpmパッケージでも型定義されていないようなので自分で定義する。
// 仕様書：https://www.w3.org/TR/clipboard-apis/#clipboard-interface

declare global {
  interface Clipboard {
    read(): Promise<ClipboardItem[]>
    write(clipboardItems: ClipboardItem[]): Promise<void>
  }

  class ClipboardItem {
    constructor(data: {[mimeType: string]: Blob})
    getType(type: string): Promise<Blob>
  }
}
