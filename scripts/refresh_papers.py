#!/usr/bin/env python3
"""Rewrite data/papers.json from the Hugging Face daily-papers feed.

Run by .github/workflows/refresh-papers.yml on a schedule, and usable by hand:
    python3 scripts/refresh_papers.py

This only touches data/papers.json. The editorial snapshot date in data/meta.json
is deliberately left alone: a bot refreshing papers has not re-checked conference
dates or timelines, and bumping that date would imply otherwise.
"""
import datetime as dt
import json
import os
import re
import urllib.request

API = "https://huggingface.co/api/daily_papers?limit=15"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "papers.json")

# keywords -> tag shown on the card, most specific first; first match wins.
# Matching is whole-word (a bare substring test lets "rag" match "average" and
# "speaker" match "speakers naturally alternate", which mistags badly).
# title_only rules are too generic to trust against an abstract.
TAGS = [
    (("agent", "agents", "agentic"), "Agents", False),
    (("reinforcement learning", "rl"), "RL", False),
    (("diffusion",), "Diffusion", False),
    (("vision-language", "vision language", "vlm", "lvlm"), "VLM", False),
    (("multimodal",), "Multimodal", False),
    (("3d", "point cloud"), "3D", False),
    (("speech", "audio", "asr", "tts", "speaker verification"), "Audio", False),
    (("retrieval", "retrieval-augmented", "reranker", "rag"), "Retrieval", False),
    (("benchmark", "benchmarking"), "Benchmark", True),
    (("video", "image", "visual", "segmentation"), "CV", True),
    (("pretraining", "pre-training", "distillation"), "Training", True),
]


def _hit(keys, text):
    return any(re.search(rf"\b{re.escape(k)}\b", text, re.I) for k in keys)


def pick_tag(title, summary):
    # Title first — it states what the paper *is*; abstracts mention everything.
    for keys, tag, _ in TAGS:
        if _hit(keys, title):
            return tag
    for keys, tag, title_only in TAGS:
        if not title_only and _hit(keys, summary):
            return tag
    return None


def first_sentence(text):
    text = " ".join((text or "").split())
    parts = re.split(r"(?<=\.)\s", text)
    return parts[0] if parts else text


def main():
    req = urllib.request.Request(API, headers={"User-Agent": "ai-research-tracker"})
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = json.load(r)

    items = [d.get("paper", d) for d in raw]
    items = [p for p in items if p and p.get("title")]
    items.sort(key=lambda p: -(p.get("upvotes") or 0))
    if not items:
        raise SystemExit("Hugging Face returned no papers; leaving the snapshot untouched.")

    papers = []
    for p in items:
        summary = p.get("summary") or ""
        extras = []
        n = len(p.get("authors") or [])
        if n > 1:
            extras.append(f"{n} authors")
        published = p.get("publishedAt") or ""
        if published:
            when = dt.datetime.fromisoformat(published.replace("Z", "+00:00"))
            extras.append(when.strftime("%b %Y"))

        entry = {
            "votes": p.get("upvotes") or 0,
            "title": p["title"].strip(),
            "arxiv": p.get("id") or "",
            "desc": first_sentence(summary),
            "extras": extras,
        }
        tag = pick_tag(entry["title"], summary)
        if tag:
            entry["tag"] = tag
        # Key order matches the hand-written file so diffs stay readable.
        papers.append({k: entry[k] for k in ("votes", "title", "arxiv", "desc", "tag", "extras")
                       if k in entry})

    payload = {
        "snapshot": dt.datetime.now(dt.timezone.utc).strftime("%B %-d, %Y"),
        "papers": papers,
    }
    with open(OUT, "w") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"wrote {len(papers)} papers, top: {papers[0]['votes']} votes — {papers[0]['title'][:60]}")


if __name__ == "__main__":
    main()
