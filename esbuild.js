const {build} = require('esbuild')

build({
  entryPoints: [],
  outdir: './dist',
  bundle: true,
  sourcemap: 'inline',
}).catch(() => {
  process.exit(1)
})
