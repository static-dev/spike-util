# Spike Utils

[![npm](http://img.shields.io/npm/v/spike-utils.svg?style=flat)](https://badge.fury.io/js/spike-utils) [![tests](http://img.shields.io/travis/static-dev/spike-utils/master.svg?style=flat)](https://travis-ci.org/static-dev/spike-utils) [![dependencies](http://img.shields.io/david/static-dev/spike-utils.svg?style=flat)](https://david-dm.org/static-dev/spike-utils) [![coverage](http://img.shields.io/coveralls/static-dev/spike-utils.svg?style=flat)](https://coveralls.io/github/static-dev/spike-utils)

A grab bag of utilities for spike plugins

> **Note:** This project is in early development, and versioning is a little different. [Read this](http://markup.im/#q4_cRZ1Q) for more details.

### Why should you care?

[Spike](http://github.com/static-dev/spike) uses webpack as its core compiler, but fundamentally behaves a bit differently from webpack, as it's a full static site compiler rather than a javascript bundler. As such, plugins for spike frequently need to make use of a couple specific utilities. In fact, each of these utilities are used in spike's core plugins.

If you are making a spike plugin, check out the documentation below, and one of these functions might be able to save you a bunch of code :grin:

### Installation

`npm install spike-utils -S`

### Usage

All of the utilities require access to spike/webpack's `options` in order to work correctly. As such, the plugins are bundled in a class that must be initialized with the config.

```js
const SpikeUtils = require('spike-utils')

// webpack plugin apply function
apply (compiler) {
  const util = new SpikeUtils(compiler.options)
}
```

With it initialized, you can use any of the following functions:

- `addFilesAsWebpackEntries(compilation, files)` - adds one or more files to webpack's pipeline so that it is processed without having to be `require`'d in an entry.
- `getOutputPath(path)` - given a relative or absolute path to a file in a spike project, return it's output path relative to the project root.
- `removeAssets(compilation, files)` - removes assets from webpack's pipeline so that they are not written as entries.
- `resolveRelativeSourcePath(path)` - resolves a relative output path from a spike project to an absolute path to the source file.
- `isFileIgnored(file)` - given a path to a file in a spike project, returns a boolean for whether the file is ignored or not.
- `runAll(compiler, cb)` - run the given function when webpack's compiler initializes, bound to both the `run` and `run-watch` events.

For more details on any given function, check out the source! I would never say this for any other library, but this is only one simple file, with fairly small functions that are extremely thoroughly documented, so I think it's worth jumping in.

### License & Contributing

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](contributing.md)
