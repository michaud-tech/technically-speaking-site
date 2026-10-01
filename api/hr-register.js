'use strict';

const EVENT_NAMES = {
  'people-people': 'The People People Conference',
  'disrupt-hr-kw': 'DisruptHR KW',
  'other': 'Other'
};

function clean(value, max) {
  return String(value || '').trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!process.env.RESEND_API_KEY || !process.env.RESULTS_FROM_EMAIL || !process.env.RESULTS_LEAD_EMAIL) {
    return res.status(503).json({ error: 'Registration is temporarily unavailable.' });
  }
  const body = req.body || {};
  const email = clean(body.email, 254).toLowerCase();
  const eventKey = clean(body.event, 40);
  const eventName = EVENT_NAMES[eventKey] || EVENT_NAMES.other;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address to continue.' });
  }
  const payload = {
    from: process.env.RESULTS_FROM_EMAIL,
    to: [process.env.RESULTS_LEAD_EMAIL],
    reply_to: email,
    subject: `New HR course registration · ${eventName}`,
    text: `New registration for Sell the Impact of HR\n\nEmail: ${email}\nSource: ${eventName}\nRegistered: ${new Date().toISOString()}`
  };
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) return res.status(502).json({ error: 'We could not save your registration. Please try again.' });
  return res.status(200).json({ ok: true });
};
