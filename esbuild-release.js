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
})
  .then(() => {
    console.log('')
    console.log('----------------- esbuild completed -----------------')
    console.log('')
  })
  .catch(() => {
    process.exit(1)
  })
