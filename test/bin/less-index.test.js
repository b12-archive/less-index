const {resolve} = require('path');
const {execFile} = require('child_process');

const tape = require('tape-catch');
const curry = require('1-liners/curry');
const plus = require('1-liners/plus');
const spawn = require('tape-spawn');

const title = curry(plus)('The CLI tool:  ');
const lessIndex = resolve(__dirname, '../../module/bin/less-index.js');
const lessIndexCommand = curry(execFile)(lessIndex);

const cwd = resolve(__dirname, '../mock-cwd');

tape(title('Prints usage'), (is) => {
  is.plan(10);

  lessIndexCommand([], (error, _, stderr) => {
    is.equal(error && error.code, 1,
      '`less-index` fails…'
    );

    is.ok(
      /^usage:/i.test(stderr),
      '…and prints usage to stderr'
    );
  });

  lessIndexCommand(['--invalid', '--options'], (error, _, stderr) => {
    is.equal(error && error.code, 1,
      '`less-index --invalid --options` fails…'
    );

    is.ok(
      /^usage:/i.test(stderr),
      '…and prints usage to stderr'
    );
  });

  lessIndexCommand(['--invalid', '--options', 'a'], {cwd}, (
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

  lessIndexCommand(['-h'], (error, stdout) => {
    is.equal(error, null,
      '`less-index -h` succeeds…'
    );

    is.ok(
      /^usage:/i.test(stdout),
      '…and prints usage'
    );
  });

  lessIndexCommand(['--help'], (error, stdout) => {
    is.equal(error, null,
      '`less-index --help` succeeds…'
    );

    is.ok(
      /SYNOPSIS/.test(stdout),
      '…and prints manpage-like help'
    );
  });
});

tape(title('Works.'), (is) => {
  const run = spawn(is, `"${lessIndex}" a`, {cwd});

  run.succeeds(
    'succeeds'
  );

  run.timeout(500);
  run.end();
});
