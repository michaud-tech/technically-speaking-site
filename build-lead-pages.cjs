// Builds /for/<slug>.html for every lead in api/_lead-scenarios.js,
// using assessment.html as the template so styling and scoring stay in sync.
// Usage: node tools/build-lead-pages.cjs
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const { LEADS } = require(path.join(root, 'api', '_lead-scenarios.js'));
const base = fs.readFileSync(path.join(root, 'assessment.html'), 'utf8');
const outDir = path.join(root, 'for');
fs.mkdirSync(outDir, { recursive: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function swap(html, find, replace, label) {
  const hit = typeof find === 'string' ? html.includes(find) : find.test(html);
  if (!hit) throw new Error(`Template anchor not found: ${label}. assessment.html may have changed.`);
  return html.replace(find, replace);
}

const MODE_TAG = { up: 'You, pitching up', down: 'Your team, pitching you' };

LEADS.forEach((lead) => {
  const url = `https://www.technicallyspeakinghq.com/for/${lead.slug}`;
  let html = base;

  html = swap(html, '<title>Assessment | Technically Speaking</title>',
    `<title>${esc(lead.company)} pitch test | Technically Speaking</title>\n<meta name="robots" content="noindex,nofollow">`, 'title');
  html = swap(html, /<link rel="canonical"[^>]*>/, '', 'canonical');
  html = swap(html, /<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`, 'og:url');

  html = swap(html, '<p class="label">Try a pitch</p>',
    `<p class="label">Prepared for ${esc(lead.name)}, ${esc(lead.company)}</p>`, 'intro label');

  const cards = lead.scenarios
    .map((s) => `<button type="button" class="lead-card" onclick="loadBrief('${s.id}')"><span class="lead-tag">${esc(MODE_TAG[s.mode] || '')}</span><span class="lead-title">${esc(s.label)}</span><span class="lead-go">Start &rarr;</span></button>`)
    .join('');
  html = swap(html, /<div class="scenario-picker">[\s\S]*?<\/select><\/div>/,
    `<div class="scenario-picker lead-picker"><label>Choose a conversation</label>${cards}</div>`, 'scenario picker');
  html = swap(html, '<button class="btn" onclick="start()">Try a pitch</button>', '', 'start button');
  html = swap(html, '</style>\n<style>',
    `  .lead-picker{max-width:none}
  .lead-card{display:block;width:100%;text-align:left;font-family:inherit;color:var(--dark);background:#fff;border:2px solid var(--dark);padding:18px 20px;margin-top:12px;cursor:pointer;transition:.15s}
  .lead-card:hover,.lead-card:focus-visible{border-color:var(--yellow);outline:none;box-shadow:inset 6px 0 0 var(--yellow)}
  .lead-tag{display:block;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
  .lead-title{display:block;font-size:18px;font-weight:800;letter-spacing:-.01em;line-height:1.3;margin-top:6px}
  .lead-go{display:block;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-top:10px}
</style>\n<style>`, 'style block');

  const clientScenarios = lead.scenarios.map((s) => ({ id: s.id, label: s.label, paras: s.paras, ask: s.ask }));
  html = swap(html, /const SCENARIOS = \[[\s\S]*?\n\];\n/, `const SCENARIOS = ${JSON.stringify(clientScenarios, null, 2)};\n`, 'SCENARIOS');

  html = html.split('Share the pitch test').join('Share with your team');

  fs.writeFileSync(path.join(outDir, `${lead.slug}.html`), html);
  console.log(`built /for/${lead.slug}  (${lead.scenarios.length} briefs)`);
});

if (!LEADS.length) console.log('No leads in api/_lead-scenarios.js yet.');
