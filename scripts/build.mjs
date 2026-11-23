import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const cfg = JSON.parse(readFileSync(join(root, 'src/site.config.json'), 'utf8'));
const pages = JSON.parse(readFileSync(join(root, 'src/data/pages.json'), 'utf8'));
const kw = JSON.parse(readFileSync(join(root, 'src/data/keywords.json'), 'utf8'));
const layout = readFileSync(join(root, 'src/templates/layout.html'), 'utf8');

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fileFor = (p) => (p === 'index' ? 'index.html' : p + '.html');
const canonicalFor = (p) => cfg.baseUrl.replace(/\/$/, '') + '/' + (p === 'index' ? '' : p + '.html');

const navPages = pages.filter((p) => p.nav);
const nav = '<ul>' + navPages.map((p) => '<li><a href="/' + esc(fileFor(p.path)) + '">' + esc(p.navLabel || p.h1) + '</a></li>').join('') + '</ul>';

function keywordTable(clusters) {
  const head = '<tr><th>Nhóm</th><th>Từ khoá chính</th><th>Intent</th><th>Kênh</th><th>Trạng thái</th></tr>';
  const rows = clusters.map((c) => '<tr><td>' + esc(c.id + ' ' + c.group) + '</td><td>' + esc(c.primary.join(', ')) + '</td><td>' + esc(c.intent) + '</td><td>' + esc(c.channel) + '</td><td>' + esc(c.status) + '</td></tr>').join('');
  return '<table border="1" cellpadding="6" cellspacing="0">' + head + rows + '</table>';
}

function sectionHtml(s) {
  let h = '';
  if (s.h) h += '<h2>' + esc(s.h) + '</h2>';
  if (s.p) h += s.p.map((t) => '<p>' + esc(t) + '</p>').join('');
  if (s.ul) h += '<ul>' + s.ul.map((li) => '<li>' + esc(li) + '</li>').join('') + '</ul>';
  if (s.table === 'keywords') h += keywordTable(kw.clusters);
  return '<section>' + h + '</section>';
}

function render(page) {
  const vars = {
    locale: cfg.locale,
    siteName: cfg.siteName,
    siteNameNote: cfg.siteNameNote,
    draftNotice: cfg.draftNotice,
    year: cfg.year,
    title: page.title,
    description: page.description,
    keywords: (page.keywords || []).join(', '),
    canonical: canonicalFor(page.path),
    robots: 'noindex, nofollow',
    h1: page.h1,
    nav,
    body: (page.sections || []).map(sectionHtml).join('\n'),
    jsonld: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
      description: page.description,
      inLanguage: cfg.locale,
      url: canonicalFor(page.path),
      isPartOf: { '@type': 'WebSite', name: cfg.siteName, url: cfg.baseUrl },
    }),
  };
  return layout.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const built = [];
for (const page of pages) {
  const out = join(dist, fileFor(page.path));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, render(page), 'utf8');
  built.push(fileFor(page.path));
}

cpSync(join(root, 'static'), join(dist, 'static'), { recursive: true });
cpSync(join(dist, 'static', 'robots.txt'), join(dist, 'robots.txt'));

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.filter((p) => !p.noIndex).map((p) => '  <url><loc>' + canonicalFor(p.path) + '</loc></url>'),
  '</urlset>',
].join('\n');
writeFileSync(join(dist, 'sitemap.xml'), sitemap, 'utf8');

console.log('Built ' + built.length + ' pages -> dist/');
built.forEach((f) => console.log('  dist/' + f));
console.log('  dist/sitemap.xml');
console.log('  dist/robots.txt');
