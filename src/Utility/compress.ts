/** ブラウザのAPIを用いてテキストを圧縮する（JavaScriptライブラリでは低速すぎたのでこちらを採用） */
export async function compress(text: string): Promise<Uint8Array[]> {
  const cs = new CompressionStream('deflate')
  const readPromise = readStream(cs.readable)
  const writer = cs.writable.getWriter()
  await writer.write(await new Blob([text]).arrayBuffer())
  await writer.close()

  return await readPromise
}

/** ブラウザのAPIを用いてテキストを解凍する（JavaScriptライブラリでは低速すぎたのでこちらを採用） */
export async function decompress(compressedData: Uint8Array[]): Promise<string> {
  const ds = new DecompressionStream('deflate')
  const readPromise = readStream(ds.readable)
  const writer = ds.writable.getWriter()
  await writer.write(await new Blob(compressedData).arrayBuffer())
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
