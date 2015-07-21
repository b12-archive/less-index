#!/usr/bin/env node

const {stdout, stderr, exit, argv} = process;

const includes = require('array-includes');

const flags = require('minimist')(argv.slice(2), {boolean: true});
const files = flags._;

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
  !files.length ||
  Object.keys(flags).some(
    (flag) => !includes(['h', 'help'], flag)
  )
) {
  stderr.write(require('./help/usage'));
  exit(1);
}

// TODO
