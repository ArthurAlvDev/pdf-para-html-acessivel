import test from 'node:test';
import assert from 'node:assert/strict';
import { convertTextToSemanticHtml } from '../app.js';

test('converts headings and paragraphs with lang=pt-BR', () => {
  const html = convertTextToSemanticHtml({ title: 'Teste', rawText: '# Titulo\nTexto normal' });
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html, /<h1>Titulo<\/h1>/);
  assert.match(html, /<p>Texto normal<\/p>/);
});
