import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const pages = JSON.parse(readFileSync(join(root, 'src/data/pages.json'), 'utf8'));

let pass = 0;
let fail = 0;
const check = (name, ok) => { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name); } };
const read = (p) => readFileSync(join(dist, p), 'utf8');
const fileFor = (p) => (p === 'index' ? 'index.html' : p + '.html');

check('dist/ exists', existsSync(dist));
check('dist/robots.txt exists', existsSync(join(dist, 'robots.txt')));
check('dist/sitemap.xml exists', existsSync(join(dist, 'sitemap.xml')));
check('dist/static/styles.css exists', existsSync(join(dist, 'static/styles.css')));

const robots = read('robots.txt');
check('robots.txt disallows all', /Disallow:\s*\//.test(robots));
const sitemap = read('sitemap.xml');

for (const page of pages) {
  const f = fileFor(page.path);
  const okFile = existsSync(join(dist, f));
  check('page exists: ' + f, okFile);
  if (!okFile) continue;
  const html = read(f);
  check('title non-empty: ' + f, /<title>[^<]+<\/title>/.test(html));
  check('meta description: ' + f, /<meta name="description" content="[^"]+"/.test(html));
  check('canonical link: ' + f, /<link rel="canonical" href="[^"]+"/.test(html));
  check('exactly one h1: ' + f, (html.match(/<h1>/g) || []).length === 1);
  check('lang attr: ' + f, /<html lang="[a-zA-Z-]+"/.test(html));
  check('noindex robots meta: ' + f, /<meta name="robots" content="noindex/.test(html));
  check('valid json-ld: ' + f, (() => {
    const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (!m) return false;
    try { JSON.parse(m[1]); return true; } catch (e) { return false; }
  })());
  check('no unresolved tokens: ' + f, !/\{\{\w+\}\}/.test(html));
  if (!page.noIndex) check('in sitemap: ' + f, sitemap.includes('/' + (page.path === 'index' ? '' : page.path + '.html')));
  const hrefs = [...html.matchAll(/href="(\/[^"#]*)"/g)].map((m) => m[1]);
  for (const hr of hrefs) {
    const target = hr === '/' ? 'index.html' : hr.replace(/^\//, '');
    check('link resolves: ' + f + ' -> ' + hr, existsSync(join(dist, target)));
  }
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail > 0) process.exit(1);
