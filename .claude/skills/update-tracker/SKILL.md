---
name: update-tracker
description: Refresh the AI research tracker site — conference dates and deadlines, trending-papers snapshot, and timelines — then verify, commit, and push. Use when the user asks to update or refresh the tracker, conference dates, deadlines, or papers.
---

# Update the AI Research Tracker

This repo is a static site (GitHub Pages, no build step). Content lives in:

- `partials/conferences.html` — conference cards grouped by year; each card has a `<details class="keydates">` block with deadline rows
- `data/papers.json` — trending-papers snapshot (rendered by `js/app.js`)
- `partials/milestones.html`, `partials/areas.html`, `partials/companies.html` — timelines
- `data/meta.json` — the snapshot date shown across the page

## Steps

1. **Conferences** — check the official sources for new or changed dates, locations, and deadlines:
   - neurips.cc/Conferences/<year>/Dates and /FutureMeetings
   - icml.cc/Conferences/<year>/Dates and /FutureMeetings
   - iclr.cc (watch for the ICLR CFP around July–Sep each year)
   - cvpr.thecvf.com, iccv.thecvf.com, wacv.thecvf.com (per-year /Dates pages), thecvf.com/?page_id=100 for future venues
   - aaai.org/conference/aaai/aaai-<yy>/ (main-track call has deadlines)
   - <year>.ijcai.org (at-a-glance + main-track CFP), eccv.ecva.net, <year>.emnlp.org, aclweb.org events, kdd<year>.kdd.org, colmweb.org/dates.html

   Update cards in `partials/conferences.html`:
   - Replace TBA pills when dates/cities are announced; add newly announced years (ACL, EMNLP, IJCAI, KDD, COLM, ECCV 2028 etc. announce ~1 year out)
   - In each keydates block, keep flags honest: `kd-flag closed` for past deadlines, `kd-flag soon` for deadlines within ~2 months, `kd-flag expected` for unofficial estimates (label the source)
   - Remove "Happening now" pills once a conference ends; add one if a conference is running this week
   - Update the year-section counts ("7 upcoming" etc.) and drop conferences that have ended into nothing — remove the card when its year section rolls past

2. **Papers** — fetch `https://huggingface.co/api/daily_papers?limit=15`, sort by upvotes, and rewrite `data/papers.json` in its existing shape (votes / title / arxiv / desc / tag / extras). Write one-sentence descriptions; infer a short topic tag.

3. **Timelines** — web-search for major developments since the date in `data/meta.json` (new frontier/open models, agent milestones, big company news). Append entries to the relevant timelines in `partials/areas.html` and `partials/companies.html`, matching the existing `<li><span class="yr">…` format. Mark unconfirmed reports as "reported". Only add genuinely significant items — a few per update, not everything.

4. **Snapshot date** — set today's date in `data/meta.json` (format: "July 8, 2026"). It fills the header and all `.snapshot-date` spans.

5. **Verify** — serve locally (`.claude/launch.json` has a `tracker` config: `python3 -m http.server 8123`), confirm every tab renders, keydates expand, and there are no console errors.

6. **Ship** — commit with a message describing what changed, push to `main`. GitHub Pages redeploys automatically; confirm with `curl -s -o /dev/null -w '%{http_code}' https://leozxliu.github.io/ai-research-tracker/`.

## Cautions

- Prefer official conference sites over aggregators; when only an aggregator has a date, mark it `expected` and name the source.
- Watch for predatory look-alike conferences (fake "ICLR"/"ICCV" listings on waset.org, conferenceindex.org) — never source dates from them.
- Don't rewrite existing timeline history; append or correct.
