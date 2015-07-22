#!/usr/bin/env node

const {stdout, stderr, exit, argv} = process;

const includes = require('array-includes');
const promise = require('es6-promise').Promise;

const flags = require('minimist')(argv.slice(2), {boolean: true});
const directories = flags._;
delete flags._;

// Print usage

if (flags.help) stdout.write([
  require('./help/synopsis'),
  require('./help/description'),
  require('./help/options'),
].join('\n\n'));

else if (flags.h) stdout.write(require('./help/usage'));

// Exit early

if (flags.h || flags.help) exit(0);

if (
  !directories.length ||
  Object.keys(flags).some(
    (flag) => !includes(['h', 'help'], flag)
  )
) {
  stderr.write(require('./help/usage'));
  exit(1);
}

// Down to business!

const {resolve, basename} = require('path');

const {readdir, writeFile} = require('fs-promise');

const cwd = process.cwd();
const lessExtension = /\.less$/;
const isLess = (filename) => lessExtension.test(filename);
const stripExtension = (filename) => filename.replace(lessExtension, '');

promise.all(directories.map((directory) => {
  const directoryName = basename(directory);
  const absolutePath = function(path) {return resolve(cwd, path);};

  return readdir(absolutePath(directory))
    .then((allFiles) => {
      const content = allFiles
        .filter(isLess)
        .map(stripExtension)
        .map((module) => (
          `@import "./${directoryName}/${module}";\n`
        ))
        .join('')
      ;

      const path = `${absolutePath(directory)}.less`;

      return writeFile(path, content)
        .then(() => stdout.write(`Written ${path}.\n`))
      ;
    })
    .catch((error) => {
      throw error;
    })
  ;
}))
  .then(() => exit(0))
;
