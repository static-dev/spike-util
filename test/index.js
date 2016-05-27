const test = require('ava')
const path = require('path')
const fs = require('fs')
const Spike = require('spike-core')
const TestPlugin = require('./plugin')

const fixtures = path.join(__dirname, 'fixtures')

test.cb('EVERYTHING WORKS', (t) => {
  const fixturePath = path.join(fixtures, 'basic')
  const plugin = new TestPlugin({
    injectFile: path.join(fixturePath, 'views/index.txt')
  })

  t.plan(10)

  plugin.on('addFilesAsWebpackEntries', (comp) => {
    const mod = comp.modules.find((m) => m.rawRequest === './views/index.txt')
    t.truthy(String(mod._src).trim() === 'wow', true)
  })

  // TODO: this also needs to be tested with watch mode
  plugin.on('runAll', () => { t.truthy(true) })
  plugin.on('removeAssets', () => { t.truthy(true) })
  plugin.on('isFileIgnored', (r) => { t.truthy(r) })
  plugin.on('matchGlobs', (r) => { t.truthy(r.length === 2) })
  plugin.on('getOutputPath', (p) => {
    t.truthy(p.relative, 'index.txt')
    t.truthy(p.absolute.match('public'))
  })

  plugin.on('getSourcePath', (p) => {
    t.truthy(p.relative === 'views/index.txt')
    t.falsy(p.absolute.match('public'))
  })

  const project = new Spike({
    root: fixturePath,
    entry: { main: ['./entry.js'] },
    module: { loaders: [
      { test: /\.txt$/, loader: 'source' }
    ]},
    ignore: ['**/views/ignoreme.txt'],
    plugins: [plugin]
  })

  project.on('error', t.fail)
  project.on('warning', t.fail)
  project.on('compile', (res) => {
    try {
      fs.accessSync(path.join(fixturePath, 'public/index.txt.js'))
      fs.accessSync(path.join(fixturePath, 'public/ignoreme.txt.js'))
    } catch (err) {
      t.truthy(err.code === 'ENOENT')
    }
    t.end()
  })

  project.compile()
})
