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
    this.emit('getSourcePath', this.util.getSourcePath('index.txt'))
    this.emit('isFileIgnored', this.util.isFileIgnored('/views/ignoreme.txt'))
    this.emit('matchGlobs', this.util.matchGlobs(['a/foo', 'a/bar', 'b/foo'], ['a/*']))

    compiler.plugin('make', (compilation, done) => {
      this.util.addFilesAsWebpackEntries(compilation, this.injectFile)
        .then(() => this.emit('addFilesAsWebpackEntries', compilation))
        .done(() => done(), done)
    })

    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('optimize-chunk-assets', (chunks, done) => {
        this.util.removeAssets(compilation, this.injectFile, chunks)
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
