# KON Waitlist (real-customer test)

Pre-launch riddle page, solve-only (no shortcuts to the homepage) for KON Unlimited, deployed from this branch only. It is not the live site.

- `site/index.html`: the built page. The homepage link is `HOME_URL` in the page script.
- `api/join.js`: saves waitlist entries to Vercel runtime logs (`KON_JOIN`) and to `LEAD_WEBHOOK_URL` if set.
