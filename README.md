# AI Research Tracker

A single-page tracker in the style of the former Papers with Code, hosted on GitHub Pages.

**Tabs**

- **Conferences** — major AI/ML conference calendar through 2028 (NeurIPS, ICML, ICLR, CVPR, ICCV, ECCV, ACL, EMNLP, AAAI, IJCAI, KDD, COLM, WACV)
- **Trending Papers** — snapshot of Hugging Face trending papers, with a live-fetch button
- **Milestones** — landmark AI papers from 1950 to today, in chronological order
- **Area Timelines** — per-field history: LLMs, AI agents, computer vision, generative media, RL
- **Companies** — recent development timelines for OpenAI, Anthropic, Google DeepMind, Meta, DeepSeek, xAI, NVIDIA, Microsoft, Amazon, Apple, Tesla, and the open-weights ecosystem

**Updating**

The "Update this page" button copies a ready-made prompt to the clipboard; paste it into a
Claude session with access to this repo and it will refresh the content, update the snapshot
date, and push. The "Fetch latest papers" button on the Trending Papers tab pulls live data
from the Hugging Face API directly in the browser.

Content snapshot: July 8, 2026. Everything is a single self-contained `index.html` —
no build step, no dependencies.
