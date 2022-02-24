import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'
import path from 'path'
import postcssLabFunction from 'postcss-lab-function'
import copy from 'rollup-plugin-copy'
import css from 'rollup-plugin-css-only'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import svelte from 'rollup-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'

const projectRootDir = path.resolve(__dirname)

export default {
  input: {
    background: './src/Background/entryPoint.ts',
    'browser-action': './src/BrowserAction/entryPoint.ts',
    'content-script': './src/ContentScript/entryPoint.ts',
    'treeify-tab': './src/TreeifyTab/entryPoint.ts',
  },
  output: {
    dir: 'dist',
    // デフォルトは'[name]-[hash].js'なので、ビルドごとにファイルが増えてしまう
    chunkFileNames: '[name].js',
    sourcemap: 'inline',
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
    copy({
      targets: [
        { src: 'static/common/*', dest: 'dist' },
        { src: `static/${process.env.NODE_ENV}/*`, dest: 'dist' },
      ],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),

    svelte({
      preprocess: sveltePreprocess({
        postcss: {
          plugins: [postcssLabFunction()],
        },
      }),
    }),
    css({ output: 'treeify-tab.css' }),
    typescript(),
    json(),
    resolve({ browser: true, preferBuiltins: false }),
    commonjs(),

    // エラー対策。
    // 参考：http://psychedelicnekopunch.com/archives/790
    builtins(),
    globals(),
  ],
}
