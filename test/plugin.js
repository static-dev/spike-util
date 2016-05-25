const SpikeUtil = require('..')
const EventEmitter = require('events')

module.exports = class TestPlugin extends EventEmitter {
  constructor (opts = {}) {
    super()
    this.injectFile = opts.injectFile
  }

  apply (compiler) {
    this.util = new SpikeUtil(compiler.options)
    this.util.runAll(compiler, this.run.bind(this))

    this.emit('getOutputPath', this.util.getOutputPath(this.injectFile))
    this.emit('resolveRelativeSourcePath', this.util.resolveRelativeSourcePath('index.txt'))
    this.emit('isFileIgnored', this.util.isFileIgnored('/views/ignoreme.txt'))

    compiler.plugin('make', (compilation, done) => {
      this.util.addFilesAsWebpackEntries(compilation, this.injectFile)
        .then(() => this.emit('addFilesAsWebpackEntries', compilation))
        .done(() => done())
    })

    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('optimize-chunk-assets', (chunks, done) => {
        this.util.removeAssets(compilation, this.injectFile)
        this.emit('removeAssets')
        done()
      })
    })
  }

  run (compilation, done) {
    this.emit('runAll', true)
    done()
  }
}
