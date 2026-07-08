# AI Research Tracker

A single-page AI research tracker in the style of the former [Papers with Code](https://huggingface.co/papers/trending), covering conferences, trending papers, milestone research, and company timelines.

**Live site:** https://leozxliu.github.io/ai-research-tracker/

## Contents

| Tab | What it shows |
|---|---|
| **Conferences** | Major AI/ML conference calendar through 2028 — NeurIPS, ICML, ICLR, CVPR, ICCV, ECCV, ACL, EMNLP, AAAI, IJCAI, KDD, COLM, WACV — with dates, locations, and TBA status |
| **Trending Papers** | Snapshot of Hugging Face trending papers, ranked by upvotes, with a live-fetch button |
| **AI Timelines** | Landmark AI papers from 1950 (Turing) to today, as a chronological timeline grouped by era |
| **Area Timelines** | Per-field history: LLMs, AI agents, computer vision, generative media, reinforcement learning |
| **Companies** | Recent development timelines for OpenAI, Anthropic, Google DeepMind, Meta, DeepSeek, xAI, NVIDIA, Microsoft, Amazon, Apple, Tesla, and the open-weights ecosystem |

## Features

- **Zero dependencies** — plain HTML/CSS/JS; no build step, no frameworks
- **Light/dark theme** — follows the OS preference, with a manual toggle persisted in localStorage
- **Live paper fetch** — the Trending Papers tab pulls current rankings from the Hugging Face API directly in the browser
- **One-click update prompt** — the "Update this page" button copies a ready-made refresh prompt for Claude (see below)
- **Responsive** — works on mobile; wide tables scroll horizontally

## Updating the content

The page content is a static snapshot (date shown in the header). Two ways to refresh it:

1. **Trending papers only** — click **Fetch latest papers** on the Trending Papers tab; this pulls live data in the browser and needs no deploy.
2. **Everything** — click **Update this page** in the header. It copies a prompt to the clipboard; paste it into a [Claude Code](https://claude.com/claude-code) session opened in this repo. Claude re-checks conference sites, refreshes the paper snapshot, updates the timelines, bumps the snapshot date, and pushes. GitHub Pages redeploys automatically in about a minute.

## Project structure

Content, styling, and behavior are separated so updates touch only the relevant file:

```
.
├── index.html                 # thin shell: header, tab bar, empty panel host
├── css/style.css              # all styling (theme tokens, layout, components)
├── js/app.js                  # tab config + rendering, theme toggle, fetch & update buttons
├── data/
│   ├── meta.json              # content snapshot date (single source of truth)
│   └── papers.json            # trending-papers snapshot
└── partials/                  # one HTML fragment per content tab
    ├── conferences.html
    ├── papers.html            # papers tab chrome; the list renders from data/papers.json
    ├── milestones.html
    ├── areas.html
    └── companies.html
```

- **Edit content** → change the partial (or `data/papers.json` for papers)
- **Bump the snapshot date** → edit `data/meta.json` (fills every date on the page)
- **Add a tab** → add `partials/<id>.html` and one entry to the `TABS` array in `js/app.js`

To preview locally, serve the folder (fetches don't work from `file://`):
`python3 -m http.server` then open http://localhost:8000.

## Deployment

Hosted on GitHub Pages, served from the root of the `main` branch. Any push to `main` redeploys the site — there is no build pipeline.

## Data sources

- **Conferences** — official conference sites (neurips.cc, icml.cc, iclr.cc, thecvf.com, aaai.org, ijcai.org, ecva.net, aclweb.org, kdd.org, colmweb.org). Verify against the official site before making travel or submission plans; look-alike "predatory" conferences reuse these names.
- **Papers** — [Hugging Face Papers](https://huggingface.co/papers/trending) (the successor to Papers with Code) and [arXiv](https://arxiv.org)
- **Timelines** — original papers where they exist (linked inline), plus press coverage for recent company news; entries marked "reported" are unconfirmed

Content snapshot: **July 8, 2026**.
