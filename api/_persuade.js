// "How persuasive are you?" conversation (/conversation). Not its own serverless function:
// api/assess.js hands any request with a `persuade` field to this module, so the site stays at 12 functions.
//
//   { persuade: { action:'config' } }                                  -> brief + public client list
//   { persuade: { action:'reply',  clientId, history } }               -> the client's next line (roleplay only)
//   { persuade: { action:'score',  clientId, history, attempt } }      -> { total, token } (breakdown stays locked)
//   { persuade: { action:'unlock', token, email, role, seniority } }   -> full breakdown, and a lead email to Michaud
//
// Scoring uses the site grader in api/assess.js directly (same prompt, tool and normalizer),
// plus an additive CONVERSATION MODE note explaining how to read a back-and-forth.
// Env: ANTHROPIC_API_KEY, RESEND_API_KEY + RESULTS_FROM_EMAIL + RESULTS_LEAD_EMAIL (same as email-results),
//      PERSUADE_TOKEN_SECRET (optional; falls back to a key derived from ANTHROPIC_API_KEY).

const crypto = require('node:crypto');
function G() { return require('./assess.js').grader; }  // lazy: assess.js requires this file
const S = require('./_persuade-scenario.js');

const TURN_CHARS = 1500;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function parseBody(req) {
  try { return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); }
  catch (_) { return null; }
}

// Alternating user/assistant turns, starting with the learner. The client's opening line is
// added server-side, so it is never part of `history`.
function validHistory(h, mustEndWithUser) {
  if (!Array.isArray(h) || h.length === 0) return false;
  const userTurns = h.filter((t) => t && t.role === 'user').length;
  if (userTurns > S.MAX_TURNS || h.length > S.MAX_TURNS * 2) return false;
  if (mustEndWithUser && h[h.length - 1].role !== 'user') return false;
  return h.every((t, i) => t && t.role === (i % 2 ? 'assistant' : 'user') && typeof t.content === 'string'
    && t.content.trim().length > 0 && t.content.length <= TURN_CHARS);
}

async function callAnthropic(body) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal: AbortSignal.timeout(60000),
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  });
  if (!res.ok) { const e = new Error('anthropic_error'); e.status = res.status; e.detail = await res.text(); throw e; }
  return res.json();
}

function key() {
  return crypto.createHash('sha256').update('persuade:' + (process.env.PERSUADE_TOKEN_SECRET || process.env.ANTHROPIC_API_KEY || '')).digest();
}
function seal(obj) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), data]).toString('base64url');
}
function open(token) {
  try {
    const buf = Buffer.from(String(token), 'base64url');
    const d = crypto.createDecipheriv('aes-256-gcm', key(), buf.subarray(0, 12));
    d.setAuthTag(buf.subarray(12, 28));
    const obj = JSON.parse(Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString('utf8'));
    return obj && Date.now() - obj.at < TOKEN_TTL_MS ? obj : null;
  } catch (_) { return null; }
}

async function reply(client, history) {
  const data = await callAnthropic({
    model: G().MODEL,
    max_tokens: 400,
    system: S.roleplaySystem(client),
    messages: [{ role: 'user', content: '(The engineer comes over to talk to you.)' }, { role: 'assistant', content: client.opening }, ...history],
  });
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  if (!text || data.stop_reason === 'max_tokens') throw new Error('incomplete');
  return text;
}

async function scoreOnce(client, history, learnerText) {
  const data = await callAnthropic({
    model: G().MODEL,
    max_tokens: 2500,
    system: G().SCORE_SYSTEM + S.CONVERSATION_MODE,
    tools: [G().SCORE_TOOL],
    tool_choice: { type: 'tool', name: 'submit_score' },
    messages: [{ role: 'user', content: S.scoreUserContent(client, history) }],
  });
  const blocks = data.content || [];
  const tool = blocks.find((c) => c && c.type === 'tool_use' && c.input && typeof c.input === 'object');
  const raw = tool ? tool.input : G().extractJson(blocks.filter((c) => c.type === 'text').map((c) => c.text).join(''));
  if (!raw) throw new Error('no_json');
  const result = G().normalize(raw);
  if (result._found.length < 6) throw new Error('bad_shape');
  delete result._found;
  if (!result.evidenceQuote || !learnerText.includes(result.evidenceQuote)) {
    const e = new Error('ungrounded_feedback'); e.result = result; throw e;
  }
  return result;
}

// Same retry and fallback behavior as the site grader.
async function score(client, history) {
  const learnerText = history.filter((t) => t.role === 'user').map((t) => t.content).join('\n\n');
  try {
    try { return await scoreOnce(client, history, learnerText); }
    catch (e1) { if (e1.message === 'anthropic_error') throw e1; return await scoreOnce(client, history, learnerText); }
  } catch (err) {
    if (err.message === 'ungrounded_feedback' && err.result) {
      err.result.coachingFocus = 'For your next rep, choose one sentence and make its connection to your listener’s decision even more explicit.';
      err.result.evidenceQuote = '';
      return err.result;
    }
    throw err;
  }
}

async function notifyLead(t, who) {
  if (!process.env.RESEND_API_KEY || !process.env.RESULTS_FROM_EMAIL || !process.env.RESULTS_LEAD_EMAIL) return false;
  const client = S.CLIENTS[t.clientId];
  const lines = t.result.pillars.map((p) => `${p.key} ${p.subtotal}/4: ` + p.lines.map((l) => `${l.code} ${l.score}`).join(', ')).join('\n');
  const convo = [`${client.name}: ${client.opening}`].concat(t.history.map((x) => `${x.role === 'user' ? 'Them' : client.name}: ${x.content}`)).join('\n\n');
  const text = `New persuasion assessment lead\n\nEmail: ${who.email}\nRole: ${who.role || '(not given)'}\nSeniority: ${who.seniority || '(not given)'}\nClient: ${client.name} (${client.role})\nAttempt: ${t.attempt}\nScore: ${t.result.total}/12\n${lines}\n\nCoaching focus: ${t.result.coachingFocus}\n\nConversation:\n${convo}`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: process.env.RESULTS_FROM_EMAIL, to: [process.env.RESULTS_LEAD_EMAIL], reply_to: who.email, subject: `Persuasion assessment: ${t.result.total}/12, ${who.email}`, text }),
  });
  return r.ok;
}

const ROLES = ['Engineer', 'Engineering manager', 'Product', 'Data / ML', 'Design', 'Other'];
const SENIORITY = ['Early career', 'Mid-level', 'Senior / staff', 'Lead / manager', 'Director', 'VP / C-level'];

module.exports = async (req, res, b) => {
  if (!b || typeof b !== 'object') return res.status(400).json({ error: 'Bad request.' });
  if (b.action === 'config') return res.status(200).json({ ...S.publicView(), roles: ROLES, seniority: SENIORITY });

  if (b.action === 'unlock') {
    if (b.website) return res.status(400).json({ error: 'Bad request.' });
    const t = open(b.token);
    if (!t) return res.status(400).json({ error: 'This result has expired. Please run the conversation again.' });
    const email = String(b.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return res.status(400).json({ error: 'Enter a valid email address.' });
    const who = { email, role: ROLES.includes(b.role) ? b.role : '', seniority: SENIORITY.includes(b.seniority) ? b.seniority : '' };
    try { await notifyLead(t, who); } catch (e) { console.error('lead email failed', e.message); }
    return res.status(200).json(t.result);
  }

  const client = S.CLIENTS[b.clientId];
  if (!client) return res.status(400).json({ error: 'Unknown client.' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'The assessment is not configured yet.' });

  try {
    if (b.action === 'reply') {
      if (!validHistory(b.history, true)) return res.status(400).json({ error: `Send one message at a time, up to ${S.MAX_TURNS}.` });
      return res.status(200).json({ reply: await reply(client, b.history) });
    }
    if (b.action === 'score') {
      if (!validHistory(b.history, false)) return res.status(400).json({ error: 'Have at least one exchange before scoring.' });
      const attempt = b.attempt === 2 ? 2 : 1;
      const result = await score(client, b.history);
      const token = seal({ at: Date.now(), clientId: b.clientId, attempt, history: b.history, result });
      return res.status(200).json({ total: result.total, token });
    }
    return res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    console.error('persuade error', b.action, err.message, err.status || '', (err.detail || '').slice(0, 300));
    return res.status(502).json({ error: b.action === 'reply' ? 'They didn’t catch that. Please send it again.' : 'Could not score the conversation. Please try again.' });
  }
};

