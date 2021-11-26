import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import path from 'path'
import copy from 'rollup-plugin-copy'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import svelte from 'rollup-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'

const projectRootDir = path.resolve(__dirname)

export default {
  input: {
    background: './src/Background/entryPoint.ts',
    'BrowserAction/entryPoint': './src/BrowserAction/entryPoint.ts',
    'ContentScript/entryPoint': './src/ContentScript/entryPoint.ts',
    'TreeifyTab/entryPoint': './src/TreeifyTab/entryPoint.ts',
  },
  output: {
    dir: 'dist',
    // デフォルトは'[name]-[hash].js'なので、ビルドごとにファイルが増えてしまう
    chunkFileNames: '[name].js',
  },
  plugins: [
    alias({
      entries: [
        {
          find: 'src',
          replacement: path.resolve(projectRootDir, 'src'),
        },
      ],
      customResolver: resolve({
        extensions: ['.ts', '.js', '.svelte'],
      }),
    }),
    svelte({
      preprocess: sveltePreprocess(),
      emitCss: false,
    }),
    typescript(),
    json(),
    resolve({ browser: true, preferBuiltins: false }),
    commonjs(),

    // エラー対策。
    // 参考：http://psychedelicnekopunch.com/archives/790
    builtins(),
    globals(),
    copy({
      targets: [{ src: 'static/*', dest: 'dist' }],
    }),
  ],
}
