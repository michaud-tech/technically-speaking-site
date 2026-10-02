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

const ROLE_TAGS = {
  'lead-jon-1': 'VP of Sales Engineering pitching SVP of Sales',
  'lead-jon-2': 'Solutions engineer pitching VP of Sales Engineering',
  'lead-sriram-1': 'Director of Engineering pitching VP of Product',
  'lead-sriram-2': 'Engineering manager pitching Director of Engineering',
  'lead-roberto-1': 'Chief Product and Technology Officer pitching CEO',
  'lead-roberto-2': 'Engineering lead pitching Chief Product and Technology Officer',
  'lead-suzanne-1': 'Chief Developer Advisor pitching client CTO',
  'lead-suzanne-2': 'Developer advisor pitching Chief Developer Advisor',
  'lead-andrew-1': 'CTO pitching CEO',
  'lead-andrew-2': 'Engineering director pitching CTO',
  'lead-solal-1': 'Director of Engineering pitching VP of Engineering',
  'lead-solal-2': 'Team lead pitching Director of Engineering',
  'lead-rahul-1': 'SVP of Software Engineering pitching CEO',
  'lead-rahul-2': 'Engineering manager pitching SVP of Software Engineering',
  'lead-jacob-1': 'Staffing firm lead pitching client VP of Engineering',
  'lead-jacob-2': 'Senior recruiter pitching firm lead',
  'lead-amit-1': 'Machine learning manager pitching director',
  'lead-amit-2': 'Senior data scientist pitching machine learning manager',
  'lead-juncao-1': 'Head of Growth Engineering pitching VP of Growth',
  'lead-juncao-2': 'Staff engineer pitching Head of Growth Engineering'
};

LEADS.forEach((lead) => {
  const url = `https://www.technicallyspeakinghq.com/for/${lead.slug}`;
  let html = base;

  html = swap(html, '<title>Assessment | Technically Speaking</title>',
    `<title>Assessment | Technically Speaking</title>\n<meta name="robots" content="noindex,nofollow">`, 'title');
  html = swap(html, /<link rel="canonical"[^>]*>/, '', 'canonical');
  html = swap(html, /<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`, 'og:url');

  html = swap(html, '<p class="label">Try a pitch</p>',
    `<p class="label">Prepared for ${esc(lead.firstName)}</p>`, 'intro label');
  html = swap(html, '<p class="lead">You\'ll leave with one specific thing to try next.</p>', '', 'second intro paragraph');

  const cards = lead.scenarios
    .map((s) => `<button type="button" class="lead-card" onclick="loadBrief('${s.id}')"><span class="lead-tag">${esc(ROLE_TAGS[s.id] || '')}</span><span class="lead-title">${esc(s.label)}</span><span class="lead-go">Start &rarr;</span></button>`)
    .join('');
  html = swap(html, /<div class="scenario-picker">[\s\S]*?<\/select><\/div>/,
    `<div class="scenario-picker lead-picker"><label>Choose a conversation</label>${cards}</div>`, 'scenario picker');
  html = swap(html, '<button class="btn" onclick="start()">Try a pitch</button>', '', 'start button');
  html = swap(html, '</style>\n<style>',
    `  #step-intro h1{max-width:18ch}
  #step-intro>.lead{max-width:68ch}
  .lead-picker{max-width:none;display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px}
  .lead-picker>label{grid-column:1/-1;margin-bottom:-4px}
  .lead-card{display:flex;flex-direction:column;width:100%;min-height:148px;text-align:left;font-family:inherit;color:var(--dark);background:#fff;border:1px solid var(--line);border-top:5px solid var(--yellow);padding:18px 20px;cursor:pointer;transition:.15s}
  .lead-card:hover,.lead-card:focus-visible{border-color:var(--dark);outline:none;transform:translateY(-2px)}
  .lead-tag{display:block;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
  .lead-title{display:block;font-size:18px;font-weight:800;letter-spacing:-.01em;line-height:1.3;margin-top:6px}
  .lead-go{display:block;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-top:auto;padding-top:14px}
  @media(max-width:620px){main{padding-top:28px}.lead-picker{grid-template-columns:1fr}.lead-card{min-height:0}}
</style>\n<style>`, 'style block');

  const clientScenarios = lead.scenarios.map((s) => ({ id: s.id, label: s.label, paras: s.paras, ask: s.ask }));
  html = swap(html, /const SCENARIOS = \[[\s\S]*?\n\];\n/, `const SCENARIOS = ${JSON.stringify(clientScenarios, null, 2)};\n`, 'SCENARIOS');

  html = html.split('Share the pitch test').join('Share with your team');

  fs.writeFileSync(path.join(outDir, `${lead.slug}.html`), html);
  console.log(`built /for/${lead.slug}  (${lead.scenarios.length} briefs)`);
});

if (!LEADS.length) console.log('No leads in api/_lead-scenarios.js yet.');
