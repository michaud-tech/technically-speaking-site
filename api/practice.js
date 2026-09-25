const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

const BRIEF = `The learner is a TextNow intern preparing an innovation-challenge pitch. Their team proposes an in-app feature that helps users recognize suspicious messages. They want a four-week pilot using one product designer and two engineers, delaying an onboarding experiment by one sprint. Avery, the executive sponsor, wants a real user problem and a fast, credible test. Nine of 14 interviewed users reported uncertainty about unexpected messages. Six of eight prototype participants noticed the warning and chose a safer action, but the test was small and did not measure long-term harm reduction. Avery can sponsor the idea; product and engineering leaders must approve the people and sprint time.`;

async function anthropic(system, user, maxTokens = 700) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY.' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const action = String(body.action || '');
  const pitch = String(body.pitch || '').trim().slice(0, 6000);
  if (pitch.length < 20) return res.status(400).json({ error: 'Write the pitch you would actually make first.' });

  try {
    if (action === 'objection') {
      const objection = await anthropic(
        `Act as Avery, the executive sponsor in the brief. Give one realistic, concise objection to the learner's pitch. Base it on Avery's priorities, the limited evidence, the resource tradeoff, or implementation risk. Do not coach, explain, list options, or resolve it. Write only what Avery would say in the room, in 1-3 sentences.`,
        `BRIEF:\n${BRIEF}\n\nPITCH:\n${pitch}`,
        250
      );
      return res.status(200).json({ objection });
    }

    if (action === 'coach-response') {
      const objection = String(body.objection || '').trim().slice(0, 2000);
      const response = String(body.response || '').trim().slice(0, 4000);
      if (response.length < 10) return res.status(400).json({ error: 'Respond to the objection first.' });
      const feedback = await anthropic(
        `You are Michaud's TECH practice coach. Assess how the learner handled pushback. The desired sequence is: (1) loop back both content and concern, (2) check understanding, (3) ask an open question to find the interest underneath, and only then (4) ask permission to offer a path and solve through the other person's lens. Coach the thinking, not personality or polish. Do not rewrite their answer. Return two short paragraphs headed "What worked" and "Try next". Name one highest-impact next move.`,
        `BRIEF:\n${BRIEF}\n\nPITCH:\n${pitch}\n\nAVERY'S OBJECTION:\n${objection}\n\nLEARNER RESPONSE:\n${response}`,
        650
      );
      return res.status(200).json({ feedback });
    }
    return res.status(400).json({ error: 'Unknown action.' });
  } catch (error) {
    console.error('practice error', error);
    return res.status(502).json({ error: 'The coach is unavailable right now. Try again in a moment.' });
  }
};
