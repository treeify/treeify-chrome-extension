const {build} = require('esbuild')

build({
  entryPoints: [
    './src/Background/entryPoint.ts',
    './src/BrowserAction/entryPoint.ts',
    './src/ContentScript/entryPoint.ts',
    './src/TreeifyWindow/entryPoint.ts',
  ],
  outdir: './dist',
  bundle: true,
  sourcemap: 'inline',
}).catch(() => {
  process.exit(1)
})
