import test from 'node:test';
import assert from 'node:assert/strict';
import { selectPublished } from '../apps/brimframe/src/utils/publication.ts';

const entry = (id, date, draft = false) => ({
  id,
  data: { publishDate: new Date(date), draft },
});

test('no posts and draft-only collections have no public entries', () => {
  assert.deepEqual(selectPublished([]), []);
  assert.deepEqual(selectPublished([entry('draft', '2026-10-10', true)]), []);
});

test('only explicitly published posts appear, newest first, with stable ties', () => {
  const entries = [
    entry('old', '2026-01-01'),
    entry('new', '2026-10-09'),
    entry('secret-draft', '2026-10-10', true),
    entry('a-tie', '2026-10-09'),
    { id: 'missing-draft', data: { publishDate: new Date('2026-10-10') } },
  ];
  assert.deepEqual(
    selectPublished(entries).map((post) => post.id),
    ['a-tie', 'new', 'old'],
  );
  assert.equal(entries[0].id, 'old', 'the source collection is not reordered');
});
