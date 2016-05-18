const test = require('ava')
const path = require('path')
const Spike = require('spike-core')
const TestPlugin = require('./plugin')

const fixtures = path.join(__dirname, 'fixtures')

test.cb('example exports correctly', (t) => {
  const fixturePath = path.join(fixtures, 'basic')
  const plugin = new TestPlugin({
    injectFile: path.join(fixturePath, 'views/index.txt')
  })

  plugin.on('entries', console.log)

  const project = new Spike({
    root: fixturePath,
    entry: { main: ['./entry.js'] },
    module: { loaders: [
      { test: /\.txt$/, loader: 'source' }
    ]},
    plugins: [plugin]
  })

  project.on('error', t.fail)
  project.on('warning', t.fail)
  project.on('compile', (res) => {
    console.log('wowowow')
    t.end()
  })

  project.compile()
})
