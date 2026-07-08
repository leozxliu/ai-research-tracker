/* AI Research Tracker — app shell.
   Tabs are declared here; each loads its markup from partials/<id>.html.
   Paper snapshot data lives in data/papers.json; the snapshot date in data/meta.json. */

const TABS = [
  { id: 'conferences', label: 'Conferences' },
  { id: 'papers', label: 'Trending Papers' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'areas', label: 'Area Timelines' },
  { id: 'companies', label: 'Companies' },
];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- theme ---------- */

const savedTheme = localStorage.getItem('theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
document.getElementById('theme-btn').addEventListener('click', () => {
  const root = document.documentElement;
  const current = root.dataset.theme ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('theme', next);
});

/* ---------- tabs ---------- */

const tabBar = document.getElementById('tabs');
const panelHost = document.getElementById('panels');

TABS.forEach((tab, i) => {
  const btn = document.createElement('button');
  btn.id = `tab-btn-${tab.id}`;
  btn.setAttribute('role', 'tab');
  btn.setAttribute('aria-selected', String(i === 0));
  btn.setAttribute('aria-controls', `panel-${tab.id}`);
  btn.textContent = tab.label;
  btn.addEventListener('click', () => selectTab(tab.id));
  tabBar.appendChild(btn);

  const panel = document.createElement('div');
  panel.id = `panel-${tab.id}`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', btn.id);
  panel.hidden = i !== 0;
  panelHost.appendChild(panel);
});

function selectTab(id) {
  TABS.forEach(tab => {
    const selected = tab.id === id;
    document.getElementById(`tab-btn-${tab.id}`).setAttribute('aria-selected', String(selected));
    document.getElementById(`panel-${tab.id}`).hidden = !selected;
  });
}

/* ---------- content loading ---------- */

async function loadPartial(id) {
  const res = await fetch(`partials/${id}.html`);
  if (!res.ok) throw new Error(`partials/${id}.html → HTTP ${res.status}`);
  document.getElementById(`panel-${id}`).innerHTML = await res.text();
}

function renderPapers(items) {
  document.getElementById('paper-list').innerHTML = items.map(p => {
    const id = esc(p.arxiv || '');
    const meta = []
      .concat(p.tag ? [`<span class="tag">${esc(p.tag)}</span>`] : [])
      .concat((p.extras || []).map(x => `<span>${esc(x)}</span>`))
      .concat([
        `<a href="https://huggingface.co/papers/${id}">HF page</a>`,
        `<a href="https://arxiv.org/abs/${id}">arXiv</a>`,
      ]).join('');
    return `<li class="paper">
      <span class="votes"><span class="n">${esc(p.votes ?? 0)}</span><span class="lbl">votes</span></span>
      <h3><a href="https://arxiv.org/abs/${id}">${esc(p.title)}</a></h3>
      <p class="desc">${esc(p.desc)}</p>
      <p class="paper-meta">${meta}</p>
    </li>`;
  }).join('');
}

function wirePaperFetch(snapshotPapers) {
  const fetchBtn = document.getElementById('fetch-btn');
  const fetchStatus = document.getElementById('fetch-status');
  fetchBtn.addEventListener('click', async () => {
    fetchBtn.disabled = true;
    fetchStatus.className = 'fetch-status';
    fetchStatus.textContent = 'Fetching from huggingface.co…';
    try {
      const res = await fetch('https://huggingface.co/api/daily_papers?limit=15');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const items = data
        .map(d => d.paper || d)
        .filter(p => p && p.title)
        .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
        .map(p => ({
          votes: p.upvotes ?? 0,
          title: p.title,
          arxiv: p.id || '',
          desc: (p.summary || '').split(/(?<=\.)\s/)[0],
          extras: p.publishedAt
            ? [new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })]
            : [],
        }));
      if (!items.length) throw new Error('empty response');
      renderPapers(items);
      fetchStatus.className = 'fetch-status ok';
      fetchStatus.textContent = 'Live data fetched ' + new Date().toLocaleString();
    } catch (err) {
      renderPapers(snapshotPapers);
      fetchStatus.className = 'fetch-status error';
      fetchStatus.textContent = 'Live fetch failed (' + err.message + ') — the network or the ' +
        'Hugging Face API may be unavailable. Showing the stored snapshot instead.';
    } finally {
      fetchBtn.disabled = false;
    }
  });
}

/* ---------- update button ---------- */

function wireUpdateButton() {
  const updateBtn = document.getElementById('update-btn');
  const updateStatus = document.getElementById('update-status');
  const promptBox = document.getElementById('update-prompt-box');
  const updatePrompt =
    'Please update my AI tracker page (repo of the site at ' + location.href + ' ; content lives in ' +
    'partials/*.html, data/papers.json, and data/meta.json): ' +
    '(1) check official conference sites for newly announced dates/locations and update ' +
    'partials/conferences.html; (2) re-fetch the Hugging Face trending papers and replace ' +
    'data/papers.json; (3) update partials/areas.html and partials/companies.html with significant ' +
    'developments since the snapshot date in data/meta.json. Keep the existing format, bump the ' +
    'date in data/meta.json, then commit and push.';

  updateBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(updatePrompt);
      updateStatus.className = 'fetch-status ok';
      updateStatus.textContent = 'Update prompt copied — paste it to Claude to refresh every tab.';
      promptBox.hidden = true;
    } catch (err) {
      promptBox.textContent = updatePrompt;
      promptBox.hidden = false;
      updateStatus.className = 'fetch-status';
      updateStatus.textContent = 'Clipboard unavailable — copy the prompt below and paste it to Claude.';
    }
  });
}

/* ---------- boot ---------- */

async function boot() {
  wireUpdateButton();
  const [meta, papersData] = await Promise.all([
    fetch('data/meta.json').then(r => r.json()),
    fetch('data/papers.json').then(r => r.json()),
    ...TABS.map(t => loadPartial(t.id)),
  ]);
  document.querySelectorAll('.snapshot-date').forEach(el => { el.textContent = meta.updated; });
  document.getElementById('update-status').textContent = 'Content snapshot: ' + meta.updated;
  renderPapers(papersData.papers);
  wirePaperFetch(papersData.papers);
}

boot().catch(err => {
  document.getElementById('panels').innerHTML =
    '<p class="papers-note">Failed to load content (' + esc(err.message) + '). ' +
    'If you opened index.html directly from disk, serve it instead: ' +
    '<code>python3 -m http.server</code> in the repo folder, then visit http://localhost:8000.</p>';
});
