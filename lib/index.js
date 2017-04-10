/**
 * @module SpikeUtils
 */

const glob = require('glob')
const path = require('path')
const micromatch = require('micromatch')
const W = require('when')
const node = require('when/node')
const File = require('filewrap')
let SingleEntryDependency
let MultiEntryDependency

module.exports = class SpikeUtils {
  constructor (config) {
    this.conf = config
  }

  /**
   * Adds a number of files to webpack's pipeline as entires, so that webpack
   * processes them even if they are not required in the main js file.
   * TODO: move into spike core, its only really safe to use there
   * !!! WARNING: requires a webpack dependency to use !!!
   * @param {Object} compilation - object from plugin
   * @param {Array|String} files - absolute path(s) to files
   * @return {Promise.<Array>} compilation.addEntry return value for each file
   */
  addFilesAsWebpackEntries (compilation, files) {
    // require these if necessary
    if (!SingleEntryDependency) { SingleEntryDependency = require('webpack/lib/dependencies/SingleEntryDependency') }
    if (!MultiEntryDependency) { MultiEntryDependency = require('webpack/lib/dependencies/MultiEntryDependency') }

    return W.all(Array.prototype.concat(files).map((f) => {
      const file = new File(this.conf.context, f)
      const dep = new MultiEntryDependency([new SingleEntryDependency(`./${file.relative}`)], file.relative)
      const addEntryFn = compilation.addEntry.bind(compilation)

      return node.call(addEntryFn, this.conf.context, dep, file.relative)
    }))
  }

  /**
   * Returns spike-specific options from the webpack config
   * @return {Object} spike options
   */
  getSpikeOptions () {
    return this.conf.plugins.find((p) => p.name === 'spikePlugin').options
  }

  /**
   * Given a source file path, returns the path to the final output.
   * @param {String} file - path to source file
   * @return {File} object containing relative and absolute paths
   */
  getOutputPath (f) {
    let file = new File(this.conf.context, f)
    file = new File(this.conf.output.path, file.relative)

    this.getSpikeOptions().dumpDirs.forEach((d) => {
      const re = new RegExp(`^${d}\\${path.sep}`)
      if (file.relative.match(re)) {
        file = new File(this.conf.output.path, file.relative.replace(re, ''))
      }
    })

    return file
  }

  /**
   * Given a source file path and a desired output path, sets spike to write
   * the given file to the specified output path
   * @param {String} f - path to the source file, relative or absolute
   * @param {String} outPath - desired output path
   */
  modifyOutputPath (f, outPath) {
    const match = this.getSpikeOptions().files.process.find((x) => {
      return x.path === new File(this.conf.context, f).absolute
    })
    match.outPath = new File(this.conf.context, outPath).absolute
  }

  /**
   * Given a file's output path, returns the path to the source file.
   * @param {String} f - path to an output file, relative or absolute
   * @return {File} object containing relative and absolute paths
   */
  getSourcePath (f) {
    let file = new File(this.conf.output.path, f)

    // check to see if the file is from a dumpDir path
    // https://github.com/bcoe/nyc/issues/259
    /* istanbul ignore next */
    glob.sync(`${this.conf.context}/*(${this.getSpikeOptions().dumpDirs.join('|')})/**`).forEach((d) => {
      const test = new RegExp(file.relative)
      if (d.match(test)) file = new File(this.conf.context, d)
    })

    return file
  }

  /**
   * Removes assets from the webpack compilation, so that static files are not
   * written to the js file, since we already write them as static files.
   *
   * The `addFilesAsWebpackEntries` function uses the relative source path
   * to name files, and `this.conf.output.name` appends '.js' to the end, so
   * this is how the files appear in the compilation assets.
   *
   * As such, we transform the array of paths to ensure that we are getting a
   * relative source path, then append '.js' to the end. We then loop through
   * webpack's compilation assets and remove the ones we don't want to write.
   *
   * @param {Object} compilation - webpack compilation object from plugin
   * @param {Array|String} _files - path(s) to source files, relative/absolute
   * @param {Array} [chunks] - webpack chunks object
   * @param {Function} done - callback
   */
  removeAssets (compilation, _files, chunks) {
    const files = Array.prototype.concat(_files).map((f) => {
      return (new File(this.conf.context, f)).relative
    })

    // first we remove the files from webpack's `assets`
    const filesDotJs = files.map((f) => `${f}.js`)
    for (const a in compilation.assets) {
      if (filesDotJs.indexOf(a) > -1) { delete compilation.assets[a] }
    }

    // Now we remove any chunks that are not further processed.
    // Directly modifying the webpack object is tricky, we need a mutating
    // method (splice), and we need the mutations not to affect the indices,
    // hence the reverse.
    if (chunks) {
      const staticChunks = chunks.reduce((m, c, i) => {
        if (files.indexOf(c.name) > -1) m.push(i); return m
      }, [])
      staticChunks.reverse().forEach((i) => chunks.splice(i, 1))
    }
  }

  /**
   * Boolean return whether a file matches any of the configured ignores.
   * @param {String} file - absolute or relative file path
   * @return {Boolean} whether the file is ignored or not
   */
  isFileIgnored (file) {
    const f = new File(this.conf.context, file)
    return micromatch.any(f.absolute, this.getSpikeOptions().ignore)
  }

  /**
   * A shortcut to run a plugin on initialization in compile and watch mode.
   * @param {Compiler} compiler - webpack compiler instance from plugin
   * @param {Function} cb - function to be run in watch and compile mode
   */
  runAll (compiler, cb) {
    compiler.plugin('run', cb)
    compiler.plugin('watch-run', cb)
  }

  /**
   * Micromatch alias for simple glob matching.
   * @param {Array} strings - array of strings to match against
   * @param {Array|String} patterns - glob patterns for matching
   * @param {Object} [options] - micromatch options
   * @return {Array} array of matching strings
   */
  matchGlobs () {
    return micromatch.apply(micromatch, arguments)
  }

  /**
   * Converts an array of paths to a regex that matches those paths. Useful for
   * when you need to add a loader that only matches specific files.
   */
  pathsToRegex (paths) {
    if (!paths.length) { return new RegExp('^.^') }
    return new RegExp(paths.map((p, i) => {
      return p.replace(/\//g, '\\/')
    }).join('|'))
  }
}
