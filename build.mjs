import * as esbuild from 'esbuild'
import { execFileSync } from 'child_process'
import { cpSync, copyFileSync, mkdirSync } from 'fs'

mkdirSync('dist', { recursive: true })
cpSync('public', 'dist', { recursive: true })
copyFileSync('index.html', 'dist/index.html')

execFileSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['tailwindcss', '-i', './src/index.css', '-o', './dist/index.css', '--minify'],
  { stdio: 'inherit' },
)

await esbuild.build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: 'dist/main.js',
  platform: 'browser',
  format: 'esm',
  minify: true,
  loader: { '.css': 'empty' },
  define: { 'process.env.NODE_ENV': '"production"' },
})
