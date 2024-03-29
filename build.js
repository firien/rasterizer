import esbuild from 'esbuild';
import ghPages from 'esbuild-plugin-ghpages-pwa';

let { plugin: githubPages, buildOptions } = ghPages({
  app: 'rasterizer',
  name: 'rasterizer',
  description: 'Convert SVG to PNG',
  cacheTag: 7,
  serve: 3014
})

try {
  await esbuild.build(Object.assign(buildOptions, {
    entryPoints: [
      'javascripts/rasterizer.js',
      'stylesheets/index.css',
      'images/icon-152.png',
      'images/icon-167.png',
      'images/icon-180.png',
      'images/icon-192.png',
      'images/icon-512.png'
    ],
    target: ['chrome78', 'safari13'],
    plugins: [
      githubPages
    ]
  }))
} catch (err) {
  console.error(err)
  process.exit(1)
}

