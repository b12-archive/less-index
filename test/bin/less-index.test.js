const {resolve} = require('path');
const {execFile} = require('child_process');
const {readFileSync} = require('fs');

const tape = require('tape-catch');
const curry = require('1-liners/curry');
const plus = require('1-liners/plus');
const spawn = require('tape-spawn');
const rimraf = require('rimraf');

const title = curry(plus)('The CLI tool:  ');
const lessIndex = resolve(__dirname, '../../module/bin/less-index.js');
const $lessIndex = curry(execFile)(lessIndex);

const cwd = resolve(__dirname, '../mock-cwd');

tape(title('Prints usage'), (is) => {
  is.plan(10);

  $lessIndex([], (error, _, stderr) => {
    is.equal(error && error.code, 1,
      '`less-index` fails…'
    );

    is.ok(
      /^usage:/i.test(stderr),
      '…and prints usage to stderr'
    );
  });

  $lessIndex(['--invalid', '--options'], (error, _, stderr) => {
    is.equal(error && error.code, 1,
      '`less-index --invalid --options` fails…'
    );

    is.ok(
      /^usage:/i.test(stderr),
      '…and prints usage to stderr'
    );
  });

  $lessIndex(['--invalid', '--options', 'a'], {cwd}, (
    error, _, stderr
  ) => {
    is.equal(error && error.code, 1,
      '`less-index --invalid --options <directory>` fails…'
    );

    is.ok(
      /^usage:/i.test(stderr),
      '…and prints usage to stderr'
    );
  });

  $lessIndex(['-h'], (error, stdout) => {
    is.equal(error, null,
      '`less-index -h` succeeds…'
    );

    is.ok(
      /^usage:/i.test(stdout),
      '…and prints usage'
    );
  });

  $lessIndex(['--help'], (error, stdout) => {
    is.equal(error, null,
      '`less-index --help` succeeds…'
    );

    is.ok(
      /SYNOPSIS/.test(stdout),
      '…and prints manpage-like help'
    );
  });
});

tape(title('Works for a single directory.'), (is) => {
  const run = spawn(is, `"${lessIndex}" a`, {
    cwd,
    end: false,
  });

  is.plan(4);
  run.timeout(500);

  run.succeeds(
    'succeeds'
  );

  run.stdout.match(
    /written .*\.less/i,
    'prints a helpful message'
  );

  run.end(() => {
    let file;
    is.doesNotThrow(
      () => file = readFileSync(resolve(cwd, 'a.less'), 'utf-8'),
      'creates the right file'
    );

    is.equal(file,
      ['b', 'c', 'f']
        .map((name) => `@import "./a/${name}";\n`)
        .join('')
      ,
      '…with the right content'
    );

    rimraf(resolve(cwd, 'a.less'),
      () => is.end()
    );
  });
});

tape(title('Works for multiple directories.'), (is) => {
  const run = spawn(is, `"${lessIndex}" a b`, {
    cwd,
    end: false,
  });

  is.plan(4);
  run.timeout(500);

  run.succeeds(
    'succeeds'
  );

  run.stdout.match(
    /(?:written .*\.less[^]*){2}/i,
    'prints helpful messages'
  );

  run.end(() => {
    let fileA;
    let fileB;
    is.doesNotThrow(
      () => {
        fileA = readFileSync(resolve(cwd, 'a.less'), 'utf-8');
        fileB = readFileSync(resolve(cwd, 'b.less'), 'utf-8');
      },
      'creates the right files'
    );

    is.equal(fileB,
      '@import "./b/c";\n',
      '…with the right content'
    );

    rimraf(resolve(cwd, '{a,b}.less'),
      () => is.end()
    );
  });
});
