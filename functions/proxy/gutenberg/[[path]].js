/**
 * Cloudflare Pages Function — same-origin proxy to Project Gutenberg.
 *
 * The in-app EPUB reader fetches books from www.gutenberg.org, which sends no
 * CORS headers. Serving them through this same-origin route (/proxy/gutenberg/*)
 * avoids CORS entirely. This mirrors the Vite dev-server proxy in
 * apps/web/vite.config.ts and replaces the old vercel.json rewrite.
 *
 * Route: matches /proxy/gutenberg/<anything> via the [[path]] catch-all.
 */
const UPSTREAM = 'https://www.gutenberg.org';

export const onRequestGet = async ({ request }) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/proxy\/gutenberg/, '');
  const target = `${UPSTREAM}${path}${url.search}`;

  const upstream = await fetch(target, {
    headers: { 'User-Agent': 'Folio-Reader (+https://github.com/ngoni-sama/folio)' },
    // Cache EPUBs at Cloudflare's edge so we don't hammer Gutenberg.
    cf: { cacheTtl: 86400, cacheEverything: true },
  });

  const headers = new Headers(upstream.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.delete('set-cookie');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
};
