# Live Nation: assessment + self-guided course

Two pages, one new serverless function. Nothing existing is changed.

- `/livenation` (livenation.html): 5-minute assessment. Use `/livenation?round=end` after the workshops.
- `/livenation/course` (livenation/course.html): 13-activity, ~35-minute course on internal stakeholder management, same structure and scoring as /mlse.

The scored pitch everywhere is the Snap Dog scenario: you just sold a fictional hot dog brand a big partnership, and now need Morgan in venue ops to get behind it. All partners, colleagues and numbers are fictional, not Live Nation policy.

## Deploy

Copy everything in this folder to the site root, next to index.html. Keep `api/`, `ln-server/` and `livenation/` as folders. favicon.svg and the logo are copies of what's already on the site; skip them.

Adds ONE serverless function (api/livenation.js). Check your Vercel plan's function limit first. Uses the existing ANTHROPIC_API_KEY and Resend settings (RESEND_API_KEY, RESULTS_FROM_EMAIL, RESULTS_LEAD_EMAIL).

## Email gate (turn on once the deal is signed)

Off by default: anyone can try the pages, nothing is emailed.

To turn it on, add `LIVENATION_GATE=on` in Vercel environment variables and redeploy. Then:
- Both pages require an email to start.
- Participants get their results emailed to them (course: after the final pitch, both pitches together).
- You get an anonymized email for every scored pitch, subject like `[Live Nation] P-47a49bad · Assessment · start · 7/12`. No email address in it. The participant ID is the same for the same person across the assessment and the course, so you can pair start and end.
- Optional: set `LIVENATION_ID_SALT` to any private string before the first participant, and never change it after, or IDs won't match.

## Notes

- Manager confirmation: your anonymized emails show who finished, by ID only. If managers need names, that means storing emails, which this deliberately doesn't do.
- Tested with a simulated AI coach and simulated email: gate on and off, full course, assessment start and end, all emails, mobile widths. Live AI output still needs one real run after deploy.
