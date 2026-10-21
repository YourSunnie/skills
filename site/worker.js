// skills.yoursunnie.com: the pages built by build.mjs, as Markdown for an agent, and a Git remote.
// Git's first request (/info/refs) is redirected to the repository on GitHub; git then talks to GitHub
// directly (Sunnie's installer follows only that initial redirect), so the repository's name stays
// https://skills.yoursunnie.com wherever the files are kept.
const MARKDOWN = 'text/markdown; charset=utf-8';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (/(^|\/)(info\/refs|git-upload-pack)$/.test(path)) {
      if (!path.endsWith('git-upload-pack') && url.searchParams.get('service') !== 'git-upload-pack') {
        return new Response('Only fetching is offered here.\n', { status: 403 });
      }
      const target = `${env.GIT_UPSTREAM}${path.replace(/^\/(\.git\/?)?/, '/')}${url.search}`;
      return Response.redirect(target, 307);
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed.\n', { status: 405 });

    const file = path === '/' ? '/index.md' : path === '/index.json' ? path : /^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path) ? `${path}.md` : null;
    const asset = file && await env.ASSETS.fetch(new URL(file, url.origin));
    if (!asset || !asset.ok) {
      return new Response(`No such skill. Every skill is listed at ${url.origin}/\n`, { status: 404, headers: { 'content-type': MARKDOWN } });
    }
    return new Response(asset.body, {
      headers: {
        'content-type': file.endsWith('.json') ? 'application/json; charset=utf-8' : MARKDOWN,
        'cache-control': 'public, max-age=300',
        'access-control-allow-origin': '*',
      },
    });
  },
};
