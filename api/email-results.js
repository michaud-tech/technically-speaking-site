const SCENARIOS = {
  payments: {
    title: 'Payments service rebuild',
    brief: `You're a senior engineer responsible for the payments service. You believe the team needs six weeks to replace part of the service before building more features on top of it. The current architecture is seven years old, has fourteen dependencies, and has become increasingly difficult for engineers to change safely. Your team has spent a lot of time responding to incidents, and the project would displace two items currently planned for Q3.\n\nYou're speaking to Dana, your VP of Engineering. Dana is accountable for delivering the Q3 roadmap and has pushed back before on technical cleanup that wasn't connected to a customer outcome.\n\nThe payments service has caused three incidents this quarter. Each one took checkout down for customers, and the most recent took nearly four hours to resolve.\n\nDana can support the project, but because it changes the roadmap, she'll need to take the recommendation to the product executive. You have five minutes with Dana in the roadmap review.\n\nMake the case to Dana for prioritizing the payments-service replacement. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  pipeline: {
    title: 'Analytics pipeline migration',
    brief: `You're a senior engineer who owns the data pipeline behind the company's customer-facing analytics dashboards. You believe the team needs about a month to move the pipeline onto a more reliable system before the next wave of enterprise customers onboards. It was built for a tenth of today's data volume, runs on nightly batch jobs, and now fails roughly once a week, each failure needing manual repair. Doing this would push back a reporting feature Sales has been asking for.\n\nYou're speaking to Priya, a Director of Product. Priya is measured on new-customer activation and has said before that she doesn't want engineering “gold-plating” systems that already work.\n\nIn the last two months, dashboard data has been wrong or delayed for customers four times, and two enterprise accounts have opened support tickets about it.\n\nPriya can back the work, but the reporting feature was promised to Sales leadership, so she'd have to renegotiate that commitment with them. You have ten minutes with Priya before sprint planning.\n\nMake the case to Priya for prioritizing the pipeline migration. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  auth: {
    title: 'Authentication rebuild',
    brief: `You're a senior engineer responsible for the login and account system. You believe the team needs five weeks to rebuild how the service handles authentication before the company's enterprise launch. The current system stores sessions in a way that's now ten years old, relies on a library that's no longer maintained, and takes days of careful work to change without risking lockouts. Taking this on would delay a single sign-on feature already slotted for next quarter.\n\nYou're speaking to Marcus, your Director of Engineering. Marcus is accountable for shipping the enterprise launch on schedule and has previously declined work framed as “paying down debt” with no clear payoff.\n\nThis quarter, two brief outages locked customers out of their accounts, and the security team has flagged the unmaintained library as a risk in the upcoming enterprise security review.\n\nMarcus can approve the work, but because it moves the launch plan, he'll need to clear it with the head of the enterprise business. You have five minutes with Marcus in the planning review.\n\nMake the case to Marcus for prioritizing the authentication rebuild. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
};

const RUBRIC = [
  ['T', 'Target Audience'],
  ['E', 'End Goal'],
  ['C', 'Clarity'],
];

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function cleanResult(input) {
  if (!input || typeof input !== 'object') return null;
  const byKey = new Map((Array.isArray(input.pillars) ? input.pillars : []).map((p) => [p && p.key, p]));
  const pillars = RUBRIC.map(([key, name]) => {
    const source = byKey.get(key) || {};
    const lines = (Array.isArray(source.lines) ? source.lines : []).slice(0, 2).map((line) => ({
      label: String(line && line.label || '').slice(0, 100),
      score: Math.max(0, Math.min(2, parseInt(line && line.score, 10) || 0)),
      note: String(line && line.note || '').slice(0, 800),
    }));
    if (lines.length !== 2) return null;
    return { key, name, lines, subtotal: lines.reduce((sum, line) => sum + line.score, 0) };
  });
  if (pillars.some((p) => !p)) return null;
  return {
    total: pillars.reduce((sum, p) => sum + p.subtotal, 0),
    pillars,
    coachingFocus: String(input.coachingFocus || input.topFix || '').slice(0, 1200),
  };
}

function resultHtml({ scenario, pitch, result }) {
  const scores = result.pillars.map((pillar) => `
    <h3 style="margin:28px 0 8px;font-size:18px">${pillar.key} — ${esc(pillar.name)} <span style="color:#6b6b68">${pillar.subtotal}/4</span></h3>
    ${pillar.lines.map((line) => `<div style="padding:12px 0;border-top:1px solid #dad5cb"><strong>${esc(line.label)} — ${line.score}/2</strong><br><span style="color:#555">${esc(line.note)}</span></div>`).join('')}
  `).join('');
  return `<!doctype html><html><body style="margin:0;background:#f4f2ed;color:#1d1d1b;font-family:Arial,sans-serif;line-height:1.55"><div style="max-width:680px;margin:auto;padding:36px 22px">
    <div style="font-size:12px;font-weight:bold;letter-spacing:.16em;color:#6b6b68">TECHNICALLY SPEAKING · YOUR ASSESSMENT</div>
    <h1 style="font-size:34px;line-height:1.08;margin:12px 0 8px">Your case scored ${result.total}/12.</h1>
    <p style="color:#555;margin:0 0 28px">Here’s the brief, exactly what you wrote, and how each part landed.</p>
    <div style="background:#1d1d1b;color:#f4f2ed;padding:24px;border-top:5px solid #f4c400"><div style="color:#f4c400;font-size:12px;font-weight:bold;letter-spacing:.12em">THE BRIEF · ${esc(scenario.title)}</div><p style="white-space:pre-line">${esc(scenario.brief)}</p></div>
    <h2 style="font-size:23px;margin:30px 0 10px">Your pitch</h2><div style="background:#fff;padding:22px;white-space:pre-wrap;border:1px solid #dad5cb">${esc(pitch)}</div>
    <h2 style="font-size:23px;margin:34px 0 6px">Your scores</h2>${scores}
    <div style="background:#1d1d1b;color:#f4f2ed;padding:22px;margin-top:28px;border-top:5px solid #f4c400"><div style="color:#f4c400;font-size:12px;font-weight:bold;letter-spacing:.12em">THE ONE THING TO FIX</div><p style="font-size:17px;margin:9px 0 0">${esc(result.coachingFocus)}</p></div>
    <p style="margin-top:30px"><a href="https://technicallyspeakinghq.com/book" style="display:inline-block;background:#f4c400;color:#1d1d1b;padding:13px 18px;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:.08em">BOOK A CALL</a></p>
    <p style="font-size:12px;color:#6b6b68;margin-top:28px">You asked for this copy after completing the free Technically Speaking assessment.</p>
  </div></body></html>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!process.env.RESEND_API_KEY || !process.env.RESULTS_FROM_EMAIL || !process.env.RESULTS_LEAD_EMAIL) {
    return res.status(500).json({ error: 'Email delivery is not configured yet.' });
  }
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch (error) {
    return res.status(400).json({ error: 'Bad request.' });
  }
  if (body.website) return res.status(200).json({ ok: true });
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ error: 'Enter a valid email address.' });
  const scenario = SCENARIOS[body.scenarioId];
  const pitch = String(body.pitch || '').trim();
  const result = cleanResult(body.result);
  if (!scenario || pitch.length < 15 || pitch.length > 6000 || !result) return res.status(400).json({ error: 'These results could not be emailed.' });

  const participantResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESULTS_FROM_EMAIL,
      to: [email],
      reply_to: process.env.RESULTS_LEAD_EMAIL,
      subject: `Your TECH assessment results — ${result.total}/12`,
      html: resultHtml({ scenario, pitch, result }),
    }),
  });
  if (!participantResponse.ok) {
    console.error('Resend participant error', participantResponse.status, await participantResponse.text());
    return res.status(502).json({ error: 'Could not send the email. Please try again.' });
  }

  // Lead notification intentionally contains only the opted-in address. The
  // participant's brief, pitch, scores, and feedback remain private to them.
  const leadResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESULTS_FROM_EMAIL,
      to: [process.env.RESULTS_LEAD_EMAIL],
      reply_to: email,
      subject: `New assessment lead: ${email}`,
      text: `A visitor requested a copy of their TECH assessment results.\n\nEmail: ${email}`,
    }),
  });
  if (!leadResponse.ok) {
    // Their results were delivered, so do not tell the participant delivery
    // failed just because the internal lead notification had an issue.
    console.error('Resend lead notification error', leadResponse.status, await leadResponse.text());
  }
  return res.status(200).json({ ok: true });
};
