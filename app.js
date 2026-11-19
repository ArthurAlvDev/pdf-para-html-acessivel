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

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
