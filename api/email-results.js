const SCENARIOS = {
  'gsw-partnership': {
    title: 'Expanded partnership renewal',
    brief: `You're on the Golden State Warriors Global Partnerships team. A national financial services brand is considering renewing its partnership for another three years. You recommend expanding the partnership beyond its current arena presence to include a co-branded content series and a community financial-literacy program. The expanded package would increase the partner's annual investment by 15%.

You're speaking to Jordan, the brand's Chief Marketing Officer. Jordan is accountable for growth and brand relevance, and has said the renewal needs to do more than generate impressions.

The current partnership's hospitality inventory was 82% utilized. Co-branded content performed 34% above the team's usual engagement benchmark, and last season's community event reached 12,000 Bay Area students and families. Direct lead attribution is incomplete, so you cannot claim the partnership caused new account growth. The strongest evidence is engagement, participation and access to Warriors fans.

Jordan can support the direction, but the additional investment needs approval from the brand's finance lead. You have ten minutes with Jordan in the renewal meeting.

Make the case to Jordan for the expanded three-year renewal. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  payments: {
    title: 'Payments service rebuild',
    brief: `You're a senior engineer responsible for the payments service. You believe the team needs six weeks to replace part of the service before building more features on top of it. The current architecture is seven years old, has fourteen dependencies, and has become increasingly difficult for engineers to change safely. Your team has spent a lot of time responding to incidents, and the project would displace two items currently planned for Q3.

You're speaking to Dana, your VP of Engineering. Dana is accountable for delivering the Q3 roadmap and has pushed back before on technical cleanup that wasn't connected to a customer outcome.

The payments service has caused three incidents this quarter. Each one took checkout down for customers, and the most recent took nearly four hours to resolve.

Dana can support the project, but because it changes the roadmap, she'll need to take the recommendation to the product executive. You have five minutes with Dana in the roadmap review.

Make the case to Dana for prioritizing the payments-service replacement. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  pipeline: {
    title: 'Groundwater monitoring plan',
    brief: `You're a hydrogeologist advising a client on a site they want to develop. You recommend four more weeks of groundwater monitoring before they finalize the design. The first two rounds of samples show changing levels near the proposed building area. You can't yet tell whether the changes are seasonal or point to a larger problem. The extra work will cost $35,000 and could delay the design sign-off by a month.

You're speaking to Priya, the client's project director. She is accountable for the schedule and has pushed back before when technical teams asked for more data without explaining what decision it would change.

If the current design proceeds and the higher readings persist, the client may need to change the foundation plan after construction begins, at a much higher cost.

Priya can support the monitoring, but she will need to take the cost and schedule change to the client sponsor. You have ten minutes with Priya before the design review.

Make the case to Priya for four more weeks of groundwater monitoring. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  auth: {
    title: 'Study extension decision',
    brief: `You're a scientist leading a product safety study. You recommend extending the study by five weeks before the company commits to a launch date. Early results look promising, but one measure has varied widely across batches. The team needs another set of tests to learn whether the variation is a measurement issue or a real safety concern. The additional work will use $80,000 of the project budget and move the planned launch decision into the next quarter.

You're speaking to Marcus, the program director. He is accountable for the launch plan and has previously asked the team to separate real risk from scientific caution.

If the variation is real, a launch based on the current results could lead to a recall. If it is a measurement issue, the new tests should let the team move ahead with more confidence.

Marcus can approve the work, but because it moves the launch plan, he will need to explain the change to the executive team. You have five minutes with Marcus in the planning review.

Make the case to Marcus for extending the safety study. Give the pitch you would actually make, using the words you'd say in the room.`,
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
