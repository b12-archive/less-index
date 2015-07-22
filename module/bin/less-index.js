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
    (flag) => !includes([
      'h', 'help',
      'f', 'force',
      'i', 'ignore',
    ], flag)
  )
) {
  stderr.write(require('./help/usage'));
  exit(1);
}

// Down to business!

const {resolve, basename, relative} = require('path');

const {readdir, writeFile, stat} = require('fs-promise');
const parseRegexp = require('parse-regexp');

const ignoreValue = flags.i || flags.ignore;
let ignore;
if (typeof ignoreValue === 'string') {
  try {
    ignore = parseRegexp(ignoreValue);
  } catch (error) {
    if (error instanceof SyntaxError) ignore = null;
    else throw error;
  }

  if (ignore === null) {
    stderr.write(
      `Fatal: Badly formed \`--ignore\` value: \`${ignoreValue}\`. Make ` +
      'sure it’s a valid JavaScript RegExp literal.'
    );  // TODO: Test this.
    exit(1);
  }
} else {
  ignore = null;
}

const cwd = process.cwd();
const lessExtension = /\.less$/;
const isLess = (filename) => lessExtension.test(filename);
const stripExtension = (filename) => filename.replace(lessExtension, '');
const WRITTEN = {};  // A poor man’s `Symbol`.

promise.all(directories.map((originalPath) => {
  if (ignore && ignore.test(originalPath)) {
    stdout.write(`Ignored \`${originalPath}\`.\n`);
    return null;
  }

  const absolutePath = function(path) {return resolve(cwd, path);};
  const directoryPath = absolutePath(originalPath);
  const filePath = `${directoryPath}.less`;
  const relativeFilePath = `./${relative(cwd, filePath)}`;

  const paths = {originalPath, directoryPath, filePath, relativeFilePath};

  return stat(directoryPath)
    .then(
      (stats) => {
        if (!stats.isDirectory()) {
          stderr.write(
            `Fatal: \`${originalPath}\` is not a directory. Make double ` +
            'sure it’s not a regular file or something.'
          );
          exit(1);
        }

        else if (flags.f || flags.force) return paths;

        else return stat(filePath)
          .then(
            () => {
              stderr.write(
                `Fatal: \`${relativeFilePath}\` exists. Use \`--force\` ` +
                'to overwrite.'
              );
              exit(1);
            },

            () => paths
          )
        ;
      },

      () => {
        stderr.write(
          `Fatal: Can’t find \`${originalPath}\`. Make sure it’s there.`
        );
        exit(1);
      }
    )
  ;
})).then((pathObjects) => {

  promise.all(pathObjects.map((paths) => {
    if (paths === null) return null;

    const {originalPath, directoryPath, filePath, relativeFilePath} = paths;
    const directoryName = basename(originalPath);

    return readdir(directoryPath)
      .then((allFiles) => {
        const lessFiles = allFiles
          .filter(isLess)
        ;

        if (!lessFiles.length) {
          stdout.write(
            `Skipping over \`${originalPath}\` – no \`*.less\` files inside.\n`
          );
          return null;
        }

        const content = lessFiles
          .map(stripExtension)
          .map((module) => (
            `@import "./${directoryName}/${module}";\n`
          ))
          .join('')
        ;

        return writeFile(filePath, content)
          .then(() => WRITTEN)
        ;
      })

      .then(
        (event) => {
          if (event === WRITTEN) stdout.write(
            `Written \`${relativeFilePath}\`.\n`
          );
        },
        (error) => {throw error;}
      )
    ;
  }))
    .then(() => {exit(0);})
  ;
});
