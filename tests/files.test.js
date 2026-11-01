import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CONTENT_PATHS,
  MAX_UPLOAD_BYTES,
  pathAllowed,
  slugify,
  sniffType,
  uploadPath,
} from '../api/_lib/files.js';

const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2]);
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const webp = Buffer.from('RIFF\0\0\0\0WEBPVP8 ');
const pdf = Buffer.from('%PDF-1.7');

test('sniffType reads the real file type from its bytes', () => {
  assert.equal(sniffType(jpg), 'jpeg');
  assert.equal(sniffType(png), 'png');
  assert.equal(sniffType(webp), 'webp');
  assert.equal(sniffType(pdf), 'pdf');
  assert.equal(sniffType(Buffer.from('<svg></svg>')), null);
  assert.equal(sniffType(Buffer.from('RIFF\0\0\0\0WAVEfmt ')), null);
  assert.equal(sniffType(Buffer.alloc(0)), null);
});

test('slugify makes a safe filename from any title', () => {
  assert.equal(slugify('My Cool Project!'), 'my-cool-project');
  assert.equal(slugify('程序'), 'image');
  assert.equal(slugify('../../etc/passwd'), 'etc-passwd');
  assert.equal(slugify(undefined), 'image');
  assert.ok(slugify('x'.repeat(200)).length <= 60);
});

test('uploadPath builds hashed paths per kind', () => {
  assert.match(uploadPath('certificate', 'OSN', jpg).path, /^public\/images\/certificates\/osn-[0-9a-f]{8}\.jpg$/);
  assert.match(uploadPath('project', 'A', png).path, /^public\/images\/a-[0-9a-f]{8}\.png$/);
  assert.match(uploadPath('project', 'A', webp).path, /^public\/images\/a-[0-9a-f]{8}\.webp$/);
  assert.match(uploadPath('banner', 'x', jpg).path, /^public\/images\/banner-[0-9a-f]{8}\.jpg$/);
  assert.equal(uploadPath('cv', 'x', pdf).path, 'public/Kenneth-Jehezkiel-MW-CV.pdf');
});

test('a new picture gets a new filename, so the 30-day cache cannot serve the old one', () => {
  const other = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 9, 9]);
  assert.notEqual(uploadPath('project', 'A', jpg).path, uploadPath('project', 'A', other).path);
});

test('uploadPath rejects wrong types, oversize files and unknown kinds', () => {
  assert.ok(uploadPath('cv', 'x', jpg).error);
  assert.ok(uploadPath('project', 'x', pdf).error);
  assert.ok(uploadPath('project', 'x', Buffer.from('<svg/>')).error);
  assert.ok(uploadPath('project', 'x', Buffer.alloc(MAX_UPLOAD_BYTES + 1, jpg)).error);
  assert.ok(uploadPath('nope', 'x', jpg).error);
  assert.ok(uploadPath('__proto__', 'x', jpg).error);
});

test('pathAllowed permits only content and pictures', () => {
  for (const path of Object.values(CONTENT_PATHS)) assert.equal(pathAllowed(path), true);
  assert.equal(pathAllowed('public/images/a-1a2b3c4d.jpg'), true);
  assert.equal(pathAllowed('public/images/certificates/a-1a2b3c4d.png'), true);
  assert.equal(pathAllowed('public/Kenneth-Jehezkiel-MW-CV.pdf'), true);
  for (const path of [
    'api/save.js', 'package.json', 'vercel.json', 'public/index.html', 'src/App.jsx',
    'src/content/../App.jsx', 'src/content/evil.json', 'public/images/thumb/a.webp',
    'public/images/a.svg', 'public/images/../../api/save.js', '.env', '', undefined,
  ]) {
    assert.equal(pathAllowed(path), false, String(path));
  }
});
