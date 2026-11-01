import assert from 'node:assert/strict';
import { test } from 'node:test';

import { localize } from '../src/lib/localize.js';
import { ALLOWED_TOKENS, findTokens, parseRichText, plainText } from '../src/lib/richText.js';

test('localize picks the language and falls back both ways', () => {
  assert.equal(localize({ en: 'A', id: 'B' }, 'id'), 'B');
  assert.equal(localize({ en: 'A', id: '' }, 'id'), 'A');
  assert.equal(localize({ en: '', id: 'B' }, 'en'), 'B');
  assert.equal(localize('plain', 'id'), 'plain');
  assert.equal(localize(undefined, 'id'), '');
});

test('parseRichText handles bold, line breaks and tokens', () => {
  assert.deepEqual(parseRichText('a **b** c'), [
    { type: 'text', value: 'a ' },
    { type: 'bold', value: 'b' },
    { type: 'text', value: ' c' },
  ]);
  assert.deepEqual(parseRichText('x\ny'), [
    { type: 'text', value: 'x' },
    { type: 'br' },
    { type: 'text', value: 'y' },
  ]);
  assert.deepEqual(parseRichText('{age} old', { age: 17 }), [{ type: 'text', value: '17 old' }]);
  assert.deepEqual(parseRichText(''), []);
});

test('parseRichText renders malformed input literally', () => {
  assert.deepEqual(parseRichText('a ** b'), [{ type: 'text', value: 'a ** b' }]);
  assert.deepEqual(parseRichText('{nope} {'), [{ type: 'text', value: '{nope} {' }]);
  assert.deepEqual(parseRichText(undefined), []);
});

test('plainText strips bold and substitutes tokens', () => {
  assert.equal(plainText('Show **all** {count}', { count: 3 }), 'Show all 3');
  assert.equal(plainText('a\nb'), 'a b');
});

test('findTokens lists tokens and ignores stray braces', () => {
  assert.deepEqual(findTokens('{age} and {years} {'), ['age', 'years']);
  assert.deepEqual(ALLOWED_TOKENS, ['age', 'years', 'count']);
});
