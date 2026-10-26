import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PUBLIC_PAGES, renderHead, SITE_URL } from '../shared/public-pages.js';
export function generatePublicPages(dist) {
  const template = readFileSync(join(dist, 'index.html'), 'utf8');
  // Remove only metadata managed here; keep Vite's exact JS/CSS asset tags.
  const shell = template.replace(/<title>[\s\S]*?<\/title>/gi, '').replace(/<meta\s+[^>]*(?:name=["'](?:description|robots|twitter:[^"']*)["']|property=["']og:[^"']*["'])[^>]*>/gi, '').replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, '').replace(/<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/gi, '');
  const htmlFor = path => shell.replace('</head>', `${renderHead(path)}\n</head>`);
  for (const route of Object.keys(PUBLIC_PAGES)) { const output=join(dist, route === '/' ? 'index.html' : route.slice(1) + '.html'); mkdirSync(dirname(output), {recursive:true}); writeFileSync(output, htmlFor(route)); }
  writeFileSync(join(dist, 'thank-you.html'), htmlFor('/thank-you'));
  writeFileSync(join(dist, 'private.html'), htmlFor('/admin'));
  writeFileSync(join(dist, '404.html'), htmlFor('/missing').replace(/<div id="root">[\s\S]*?<\/div>/, '<div id="root"><main><img src="/brand/c05/logos/logo-horizontal-primary.svg" alt="HomeReady Scores" width="216" height="66"><h1>Page not found</h1><p>This address is unavailable. <a href="/">Return to Home Ready Scores</a> or <a href="/get-started">Get Started Now</a>.</p></main></div>'));
  writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /portal\nDisallow: /sign-contract\nDisallow: /thank-you\nDisallow: /api/\nDisallow: /private\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(PUBLIC_PAGES).map(p=>`<url><loc>${SITE_URL}${p==='/'?'':p}</loc></url>`).join('')}</urlset>\n`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) generatePublicPages(resolve(process.argv[2] || 'dist'));
