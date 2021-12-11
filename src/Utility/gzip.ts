/**
 * 一部のブラウザで実装されているCompression Streams APIを用いてテキストをgzip圧縮する。
 * クロスブラウザの圧縮ライブラリでは低速すぎたのでこちらを採用した。
 */
export async function compress(text: string): Promise<Uint8Array[]> {
  const cs = new CompressionStream('gzip')
  const readPromise = readStream(cs.readable)
  const writer = cs.writable.getWriter()
  await writer.write(await new Blob([text]).arrayBuffer())
  await writer.close()

  return await readPromise
}

/**
 * 一部のブラウザで実装されているCompression Streams APIを用いてテキストをgzip解凍する。
 * クロスブラウザの圧縮ライブラリでは低速すぎたのでこちらを採用した。
 */
export async function decompress(compressedData: ArrayBuffer): Promise<string> {
  const ds = new DecompressionStream('gzip')
  const readPromise = readStream(ds.readable)
  const writer = ds.writable.getWriter()
  await writer.write(compressedData)
  await writer.close()

  const readResult = await readPromise
  return new TextDecoder().decode(await new Blob(readResult).arrayBuffer())
}

/** {@link compress}と{@link decompress}のためのヘルパー関数 */
async function readStream<T>(readable: ReadableStream<T>): Promise<T[]> {
  const reader = readable.getReader()
  const resultArray: T[] = []
  while (true) {
    const result = await reader.read()
    if (result.done) break

    resultArray.push(result.value)
  }
  return resultArray
}
