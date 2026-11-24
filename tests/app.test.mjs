import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { convertTextToSemanticHtml, convertBatchToReports, buildComplianceReport } from '../app.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('converts headings and paragraphs with lang=pt-BR', () => {
  const html = convertTextToSemanticHtml({ title: 'Teste', rawText: '# Titulo\nTexto normal' });
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html, /<h1>Titulo<\/h1>/);
  assert.match(html, /<p>Texto normal<\/p>/);
});

test('batch mode generates WCAG 2.2 AA / eMAG reports in JSON, MD, and HTML', () => {
  const items = [
    { title: 'Edital 1', rawText: '# Edital 1\nTexto simples.' },
    { title: 'Edital 2', rawText: 'Sem titulo h1.' }
  ];
  const reports = convertBatchToReports(items);
  assert.equal(reports.length, 2);
  assert.equal(reports[0].score, 100);
  assert.equal(reports[1].score, 75);

  const json = JSON.parse(buildComplianceReport(items, 'json'));
  assert.equal(json.totalDocuments, 2);
  assert.match(buildComplianceReport(items, 'md'), /WCAG 2\.2 AA \/ eMAG/);
  assert.match(buildComplianceReport(items, 'html'), /<!DOCTYPE html>/);
});

test('index.html and sitemap.xml include SEO, analytics, and B2B waitlist info', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.match(html, /<meta name="description"/);
  assert.match(html, /\/_vercel\/insights\/script\.js/);
  assert.match(html, /119–149/);
  assert.match(html, /349–399/);
  assert.match(sitemap, /https:\/\/pdf\.olacdev\.com\//);
});
