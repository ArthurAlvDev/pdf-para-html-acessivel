export function convertTextToSemanticHtml({ title = 'Documento Acessível', rawText = '' }) {
  const lines = String(rawText).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const body = lines.map((line) => {
    if (/^#\s+/.test(line)) return `<h1>${escapeHtml(line.replace(/^#\s+/, ''))}</h1>`;
    if (/^##\s+/.test(line)) return `<h2>${escapeHtml(line.replace(/^##\s+/, ''))}</h2>`;
    if (/^[-*]\s+/.test(line)) return `<li>${escapeHtml(line.replace(/^[-*]\s+/, ''))}</li>`;
    return `<p>${escapeHtml(line)}</p>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>${escapeHtml(title)}</title></head>
<body><main>${body}</main></body>
</html>`;
}

export function auditDocumentWcagEmag({ title = 'Documento Acessível', rawText = '' }) {
  const html = convertTextToSemanticHtml({ title, rawText });
  const hasH1 = /<h1>/.test(html);
  const hasLang = /<html lang="pt-BR">/.test(html);
  const hasMain = /<main>/.test(html);
  const linesCount = String(rawText).split(/\r?\n/).map((l) => l.trim()).filter(Boolean).length;

  const checks = [
    { criterion: 'WCAG 3.1.1 / eMAG 1.1 (Idioma)', passed: hasLang, detail: 'lang="pt-BR" definido' },
    { criterion: 'WCAG 1.3.1 / eMAG 1.3 (Landmark main)', passed: hasMain, detail: 'Elemento <main> presente' },
    { criterion: 'WCAG 2.4.6 / eMAG 1.5 (Título principal h1)', passed: hasH1, detail: hasH1 ? '<h1> identificado' : 'Adicione # Título principal' },
    { criterion: 'WCAG 2.4.2 (Title descritivo)', passed: Boolean(String(title).trim()), detail: title }
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  return {
    title,
    linesCount,
    score: Math.round((passedCount / checks.length) * 100),
    checks,
    html
  };
}

export function convertBatchToReports(items = []) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item && String(item.rawText || '').trim())
    .map((item, idx) => auditDocumentWcagEmag({
      title: item.title || `Documento ${idx + 1}`,
      rawText: item.rawText
    }));
}

export function buildComplianceReport(items = [], format = 'json') {
  const reports = convertBatchToReports(items);
  const generatedAt = new Date().toISOString();

  if (format === 'md') {
    const lines = [
      '# Relatório de Conformidade WCAG 2.2 AA / eMAG (Modo Lote)',
      '',
      `- **Gerado em:** ${generatedAt}`,
      `- **Total de documentos:** ${reports.length}`,
      ''
    ];
    reports.forEach((r, idx) => {
      lines.push(`## ${idx + 1}. ${r.title} (${r.score}%)`);
      r.checks.forEach((c) => {
        lines.push(`- [${c.passed ? 'x' : ' '}] ${c.criterion}: ${c.detail}`);
      });
      lines.push('');
    });
    return lines.join('\n');
  }

  if (format === 'html') {
    const sections = reports.map((r) => {
      const itemsHtml = r.checks
        .map((c) => `<li><strong>${c.passed ? 'OK' : 'Revisar'}:</strong> ${escapeHtml(c.criterion)} — ${escapeHtml(c.detail)}</li>`)
        .join('');
      return `<section><h2>${escapeHtml(r.title)} (${r.score}%)</h2><ul>${itemsHtml}</ul></section>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Relatório WCAG 2.2 AA / eMAG</title></head>
<body><main><h1>Relatório WCAG 2.2 AA / eMAG</h1><p>Documentos analisados: ${reports.length}</p>${sections}</main></body>
</html>`;
  }

  return JSON.stringify({
    standard: 'WCAG 2.2 AA / eMAG',
    generatedAt,
    totalDocuments: reports.length,
    documents: reports.map((r) => ({
      title: r.title,
      score: r.score,
      linesCount: r.linesCount,
      checks: r.checks
    }))
  }, null, 2);
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
