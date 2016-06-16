const Util = require('../lib')

module.exports = function (source) {
  const emitter = this.options.loaderEmitter
  emitter.emit('filePathFromLoader', Util.filePathFromLoader(this))
  return source
}
