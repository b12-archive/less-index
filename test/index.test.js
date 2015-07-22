const test = require('tape-catch');

test('Programmatic usage:  Fails', (is) => {
  is.throws(
    () => require('../module/index'),
    /`less-index` is a command-line program/i,
    'with a helpful message'
  );

  is.end();
});
