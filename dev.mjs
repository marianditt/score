import * as esbuild from 'esbuild'
import { spawn } from 'child_process'
import { cpSync, copyFileSync, mkdirSync } from 'fs'

mkdirSync('dist', { recursive: true })
cpSync('public', 'dist', { recursive: true })
copyFileSync('index.html', 'dist/index.html')

const tw = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['tailwindcss', '-i', './src/index.css', '-o', './dist/index.css', '--watch'],
  { stdio: 'inherit' },
)

const ctx = await esbuild.context({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: 'dist/main.js',
  platform: 'browser',
  format: 'esm',
  loader: { '.css': 'empty' },
  define: { 'process.env.NODE_ENV': '"development"' },
})

await ctx.watch()
const { host, port } = await ctx.serve({ servedir: 'dist', port: 3000 })
console.log(`Dev server running at http://${host}:${port}`)

process.on('SIGINT', async () => {
  tw.kill()
  await ctx.dispose()
  process.exit(0)
})
