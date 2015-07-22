const {resolve} = require('path');
const {execFile} = require('child_process');
const {readFileSync, statSync} = require('fs');

const test = require('tape-catch');
const curry = require('1-liners/curry');
const plus = require('1-liners/plus');
const rimraf = require('rimraf');
const {readFile, writeFile} = require('fs-promise');

const title = curry(plus)('The CLI tool:  ');
const lessIndex = resolve(__dirname, '../../module/bin/less-index.js');
const $lessIndex = curry(execFile)(lessIndex);

const cwd = resolve(__dirname, '../mock-cwd');

test(title('Prints usage'), (is) => {
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

test(title('Works for a single directory.'), (is) => {
  is.plan(4);
  is.timeoutAfter(500);

  $lessIndex(['a'], {cwd}, (error, stdout) => {
    is.notOk(error,
      'succeeds'
    );

    is.ok(
      /written.*`.\/a\.less`/i.test(stdout),
      'prints a helpful message'
    );

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

test(title('Works for multiple directories.'), (is) => {
  is.plan(4);
  is.timeoutAfter(500);

  $lessIndex(['a', './b'], {cwd}, (error, stdout) => {
    is.notOk(error,
      'succeeds'
    );

    is.ok(
      /(?:written.*`.*\.less`[^]*){2}/i.test(stdout),
      'prints helpful messages'
    );

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

test('Doesn’t overwrite files by default.', (is) => {
  is.plan(4);
  is.timeoutAfter(500);

  $lessIndex(['c'], {cwd}, (error, _, stderr) => {
    is.equal(error && error.code,
      1,
      'fails'
    );

    is.ok(
      /`--force`/i.test(stderr),
      'prints a helpful message to stderr'
    );

    let file;
    is.doesNotThrow(
      () => file = readFileSync(resolve(cwd, 'c.less'), 'utf-8'),
      'leaves the file…'
    );

    is.equal(file,
      'ORIGINAL\n',
      '…and its content untouched'
    );

    is.end();
  });
});

test('Overwrites files with `--force`.', (is) => {
  is.plan(4);
  is.timeoutAfter(500);

  readFile(resolve(cwd, 'c.less')).then((original) => {
    $lessIndex(['--force', 'c'], {cwd}, (error, stdout) => {
      is.notOk(error,
        'succeeds'
      );

      is.ok(
        /written.*`.*\.less`/i.test(stdout),
        'prints a helpful message'
      );

      let file;
      is.doesNotThrow(
        () => file = readFileSync(resolve(cwd, 'c.less'), 'utf-8'),
        'creates the right file'
      );

      is.equal(file,
        '@import "./c/d";\n',
        '…with the right content'
      );

      writeFile(resolve(cwd, 'c.less'), original)
        .then(() => {is.end();})
      ;
    });
  });
});

test('Ignores directories with `--ignore`.', (is) => {
  is.plan(5);
  is.timeoutAfter(500);

  $lessIndex(['--ignore=/a/', 'a', 'b'], {cwd}, (error, stdout) => {
    is.notOk(error,
      'succeeds'
    );

    is.ok(
      /ignored.*`a`/i.test(stdout),
      'prints a helpful message'
    );

    is.throws(
      () => {statSync(resolve(cwd, 'a.less'));},
      'doesn’t touch the ignored file'
    );

    let file;
    is.doesNotThrow(
      () => file = readFileSync(resolve(cwd, 'b.less'), 'utf-8'),
      'creates the right file'
    );

    is.equal(file,
      '@import "./b/c";\n',
      '…with the right content'
    );

    rimraf(resolve(cwd, 'b.less'),
      () => is.end()
    );
  });
});

test('`less-index --ignore=<bad-regex>` fails.', (is) => {
  is.plan(3);
  is.timeoutAfter(500);

  $lessIndex(['--ignore=invalid-regex', 'a'], {cwd}, (error, _, stderr) => {
    is.equal(error && error.code,
      1,
      'fails'
    );

    is.ok(
      /badly formed.*make sure.*valid javascript regexp/i.test(stderr),
      'prints a helpful message'
    );

    is.throws(
      () => {statSync(resolve(cwd, 'a.less'));},
      'doesn’t touch a file'
    );
  });
});

test('Fails when a directory doesn’t exist.', (is) => {
  is.plan(4);
  is.timeoutAfter(500);

  $lessIndex(['b', 'non-existent'], {cwd}, (error, _, stderr) => {
    is.equal(error && error.code,
      1,
      'fails'
    );

    is.ok(
      /can’t find.*`non-existent`.*make sure/i.test(stderr),
      'prints a helpful message to stderr'
    );

    is.throws(
      () => {statSync(resolve(cwd, 'b.less'));},
      'doesn’t touch the correct file'
    );

    is.throws(
      () => {statSync(resolve(cwd, 'non-existent.less'));},
      'doesn’t touch the incorrect file'
    );

    is.end();
  });
});

test('Fails when a given directory is not a directory.', (is) => {
  is.plan(4);
  is.timeoutAfter(500);

  $lessIndex(['b', 'c.less'], {cwd}, (error, _, stderr) => {
    is.equal(error && error.code,
      1,
      'fails'
    );

    is.ok(
      /`c\.less`.*not a directory.*make double sure/i.test(stderr),
      'prints a helpful message to stderr'
    );

    is.throws(
      () => {statSync(resolve(cwd, 'b.less'));},
      'doesn’t touch the correct file'
    );

    is.throws(
      () => {statSync(resolve(cwd, 'c.less.less'));},
      'doesn’t touch the incorrect file'
    );

    is.end();
  });
});

test('Skips over empty directories.', (is) => {
  is.plan(5);
  is.timeoutAfter(500);

  $lessIndex(['d', 'b'], {cwd}, (error, stdout) => {
    is.notOk(error,
      'succeeds'
    );

    is.ok(
      /skipping over `d`.*no `\*\.less` files/i.test(stdout),
      'prints a helpful message'
    );

    is.throws(
      () => {statSync(resolve(cwd, 'd.less'));},
      'doesn’t write a file for the skipped directory'
    );

    let file;
    is.doesNotThrow(
      () => file = readFileSync(resolve(cwd, 'b.less'), 'utf-8'),
      'creates the other file'
    );

    is.equal(file,
      '@import "./b/c";\n',
      '…with the right content'
    );

    rimraf(resolve(cwd, 'b.less'),
      () => is.end()
    );
  });
});
