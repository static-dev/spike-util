# Spike Util

[![npm](http://img.shields.io/npm/v/spike-util.svg?style=flat)](https://badge.fury.io/js/spike-util) [![tests](http://img.shields.io/travis/static-dev/spike-util/master.svg?style=flat)](https://travis-ci.org/static-dev/spike-util) [![dependencies](http://img.shields.io/david/static-dev/spike-util.svg?style=flat)](https://david-dm.org/static-dev/spike-util) [![coverage](http://img.shields.io/coveralls/static-dev/spike-util.svg?style=flat)](https://coveralls.io/github/static-dev/spike-util)

A grab bag of utilities for spike plugins

> **Note:** This project is in early development, and versioning is a little different. [Read this](http://markup.im/#q4_cRZ1Q) for more details.

### Why should you care?

[Spike](http://github.com/static-dev/spike) uses webpack as its core compiler, but fundamentally behaves a bit differently from webpack, as it's a full static site compiler rather than a javascript bundler. As such, plugins for spike frequently need to make use of a couple specific utilities. In fact, each of these utilities are used in spike's core plugins.

If you are making a spike plugin, check out the documentation below, and one of these functions might be able to save you a bunch of code :grin:

### Installation

`npm install spike-util -S`

### Usage

All of the utilities require access to spike/webpack's `options` in order to work correctly. As such, the plugins are bundled in a class that must be initialized with the config.

```js
const SpikeUtils = require('spike-util')

// webpack plugin apply function
apply (compiler) {
  const util = new SpikeUtils(compiler.options)
}
```

With it initialized, you can use any of the following functions:

- `util.addFilesAsWebpackEntries(compilation, files)` - adds one or more files to webpack's pipeline so that it is processed without having to be `require`'d in an entry.
- `util.getSpikeOptions()` - returns spike-specific options that are not easily accessed on the primary webpack config object
- `util.getOutputPath(path)` - given a relative or absolute path to a file in a spike project, return it's output path relative to the project root.
- `util.removeAssets(compilation, files)` - removes assets from webpack's pipeline so that they are not written as entries.
- `util.resolveRelativeSourcePath(path)` - resolves a relative output path from a spike project to an absolute path to the source file.
- `util.isFileIgnored(file)` - given a path to a file in a spike project, returns a boolean for whether the file is ignored or not.
- `util.runAll(compiler, cb)` - run the given function when webpack's compiler initializes, bound to both the `run` and `run-watch` events.
- `util.pathsToRegex(paths)` - given an array of file paths, builds a regex that will match only those paths
- `util.modifyOutputPath(file, outPath)` - Given an absolute or relative (to the project root) path to a file that's being processed by spike, changes the output path to absolute or relative (recommended) path provided. Recommended to use in the `emit` plugin stage.

For more details on any given function, check out the source! I would never say this for any other library, but this is only one simple file, with fairly small functions that are extremely thoroughly documented, so I think it's worth jumping in.

### License & Contributing

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](contributing.md)
