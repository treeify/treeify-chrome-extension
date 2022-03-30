interface DecompressionStream {
  readonly writable: WritableStream<BufferSource>
  readonly readable: ReadableStream<Uint8Array>
}

declare var DecompressionStream: {
  prototype: DecompressionStream
  new (format: 'gzip' | 'deflate'): DecompressionStream
}

interface CompressionStream {
  readonly writable: WritableStream<BufferSource>
  readonly readable: ReadableStream<Uint8Array>
}

declare var CompressionStream: {
  prototype: CompressionStream
  new (format: 'gzip' | 'deflate'): CompressionStream
}
