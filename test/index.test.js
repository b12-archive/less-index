const test = require('tape-catch');

test('Programmatic usage:  Fails', (is) => {
  is.throws(
    () => require('../module/index'),
    /…/i,
    'with a helpful message'
  );

  is.end();
});
