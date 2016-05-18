const SpikeUtil = require('..')
const EventEmitter = require('events')

module.exports = class TestPlugin extends EventEmitter {
  constructor (opts = {}) {
    super()
    this.injectFile = opts.injectFile
  }

  apply (compiler) {
    this.util = new SpikeUtil(compiler.options)
    // this.util.runAll(compiler, this.run.bind(this))

    compiler.plugin('make', (compilation, done) => {
      // return done()
      try {
        this.util.addFilesAsWebpackEntries(compilation, [this.injectFile])
          .then(() => this.emit('entries', compilation))
          .then(() => done())
          .catch(console.error)
      } catch (e) {
        // console.log(e)
      }
    })

    // getOutputPath
    // removeAssets
    // resolveRelativeSourcePath
    // isFileIgnored
  }

  run (compilation, done) {
    this.emit('runAll', true)
    done()
  }
}
