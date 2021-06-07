import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'

export default {
  input: {
    'Background/entryPoint': './src/Background/entryPoint.ts',
    'BrowserAction/entryPoint': './src/BrowserAction/entryPoint.ts',
    'ContentScript/entryPoint': './src/ContentScript/entryPoint.ts',
    'TreeifyWindow/entryPoint': './src/TreeifyWindow/entryPoint.ts',
  },
  output: {
    dir: 'dist',
    // デフォルトは'[name]-[hash].js'なので、ビルドごとにファイルが増えてしまう
    chunkFileNames: '[name].js',
  },
  plugins: [
    typescript(),
    resolve({browser: true, preferBuiltins: false}),
    commonjs(),

    // エラー対策。
    // 参考：http://psychedelicnekopunch.com/archives/790
    builtins(),
    globals(),
  ],
}
