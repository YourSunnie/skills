import assert from 'node:assert/strict';
import { test } from 'node:test';
import { frontmatter, indexPage, readSkills, SITE, skillPage } from './build.mjs';
import worker from './worker.js';

const REF = 'a'.repeat(40);

test('every skill has the fields the index needs', () => {
  const skills = readSkills();
  assert.ok(skills.length > 0);
  for (const skill of skills) {
    assert.ok(skill.files.includes('SKILL.md'));
    assert.ok(skill.description.length <= 1024);
  }
});

test('frontmatter reads quoted values and the metadata map', () => {
  const { data, body } = frontmatter('---\nname: x\ndescription: "a: b"\nmetadata:\n  for: "people"\n---\n# X\n');
  assert.deepEqual(data, { name: 'x', description: 'a: b', metadata: { for: 'people' } });
  assert.equal(body, '# X\n');
});

test('pages tell the agent the repository, path and commit to install', () => {
  const [skill] = readSkills();
  const index = indexPage([skill], REF);
  assert.match(index, new RegExp(`${SITE}/${skill.id}`));
  assert.match(index, /Purpose: .+\n- For: .+/);
  const page = skillPage(skill, REF);
  const call = JSON.parse(/```json\n([\s\S]*?)\n```/.exec(page)[1]);
  assert.deepEqual({ repository: call.repository, path: call.path, ref: call.ref }, { repository: SITE, path: skill.id, ref: REF });
  assert.ok(page.includes(skill.content.trimEnd()));
});

const env = {
  GIT_UPSTREAM: 'https://github.com/YourSunnie/skills.git',
  ASSETS: { fetch: async (url) => new URL(url).pathname === '/widget-design.md' || new URL(url).pathname === '/index.md'
    ? new Response('# page') : new Response('missing', { status: 404 }) },
};
const get = (path, init) => worker.fetch(new Request(`${SITE}${path}`, init), env);

test('pages are served as Markdown, by skill id', async () => {
  for (const path of ['/', '/widget-design', '/widget-design/']) {
    const res = await get(path);
    assert.equal(res.status, 200, path);
    assert.match(res.headers.get('content-type'), /^text\/markdown/);
  }
  assert.equal((await get('/nope')).status, 404);
  assert.equal((await get('/../secret')).status, 404);
});

test('git fetches go to the upstream repository, and only fetches', async () => {
  const refs = await get('/info/refs?service=git-upload-pack');
  assert.equal(refs.status, 307);
  assert.equal(refs.headers.get('location'), 'https://github.com/YourSunnie/skills.git/info/refs?service=git-upload-pack');
  const dotGit = await get('/.git/info/refs?service=git-upload-pack');
  assert.equal(dotGit.headers.get('location'), 'https://github.com/YourSunnie/skills.git/info/refs?service=git-upload-pack');
  assert.equal((await get('/info/refs?service=git-receive-pack')).status, 403);
  assert.equal((await get('/git-upload-pack', { method: 'POST' })).status, 307);
});
