import { scoreJob } from './scoring.js';

const STATUS_LABELS = {
  all: 'All', new: 'New Matches', saved: 'Saved', applied: 'Applied', interview: 'Interview', rejected: 'Rejected / Skipped'
};

const state = {
  jobs: [],
  status: 'new',
  query: '',
  decision: 'all',
  country: 'all',
  sort: 'priority',
  statuses: JSON.parse(localStorage.getItem('astrojob-statuses') || '{}')
};

const els = {
  grid: document.querySelector('#jobsGrid'),
  empty: document.querySelector('#emptyState'),
  stats: document.querySelector('#stats'),
  tabs: document.querySelector('#tabs'),
  search: document.querySelector('#searchInput'),
  decision: document.querySelector('#decisionFilter'),
  country: document.querySelector('#countryFilter'),
  sort: document.querySelector('#sortBy'),
  reset: document.querySelector('#resetDemo'),
  template: document.querySelector('#jobCardTemplate')
};

function getStatus(job) { return state.statuses[job.id] || 'new'; }
function setStatus(id, status) {
  state.statuses[id] = status;
  localStorage.setItem('astrojob-statuses', JSON.stringify(state.statuses));
  render();
}

function formatSalary(job) {
  const s = job.salary || {};
  if (!Number.isFinite(s.monthlyGross) && !Number.isFinite(s.annualGross)) return 'Salary: not disclosed';
  const parts = [];
  const currency = s.currency || '';
  if (Number.isFinite(s.monthlyGross)) parts.push(`${s.monthlyGross.toLocaleString()} ${currency} gross / month`);
  if (Number.isFinite(s.annualGross)) parts.push(`${s.annualGross.toLocaleString()} ${currency} gross / year`);
  return `Salary: ${parts.join(' · ')}`;
}

const TAXONOMY_IMAGES = {"core":"data:image/webp;base64,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","transferable":"data:image/webp;base64,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","stretch":"data:image/webp;base64,UklGRj4IAABXRUJQVlA4IDIIAAAwJgCdASqAAIAAPmEskUYkIqGhLJPZcIAMCWIfQAlt3c3FjM8Q/uj7FwsdM+Wj0J5yP+F6lfFq6dvm685L01f4D0Xepg3nafj9Afy2ZGWnQUCu6216zW4N5iReL+HGkqbmTM3JLki3wFIs6lO0w0Qu4DDsJ16tl5p3t/wEBKBk2yvxTXUtIDCTav1kLKWBeWvLQsfKolRa0Fl+Eof79jz5w/FPd/wS1YRwsrzpAgDAPxf4exsg64YnUzOTDZDM2jbeBkWqve4kuPOJQsp9D/j/UKsiMTw8E238Ui6Vy1zkL3X7zRsNaAi0FPhoGBfLx/uzgAISH+X2/u+tGZgxsG3/hx3Gv2562e8AZRzgBA1oBiAAC4XGzNGXZBlIVLrGHGhbyEfO+4kTY3A+ezJQP9H3g7YQL0zk6/iOAAD+/yp20QtTq7oniHOH4S0c7sDbXheyYLmepNz1w4+DL4mMA7lDG75JbwNOl5xY3N8wDxcxgdDtwBG5Smr9II+17Ne7wzmr5OYmHOXA03COGzcvmlGmngXthARhjF9pHpaMCwCWs+2A5I2YwAKr3Q9fNq0dFkOSFQ1/pzRqN01hw3rakJlGNQq+Nff/hliHycIvAcjbRDb2rDDXVLUa8iOiy4c3UCE7rN3GOsZe7MlzB1ADRYH9GhZ2erNqG+7rl8EBpLpa9L1AwuRsmfMeLc6W+nm0E0WnjewH/y5AD2tBJZQyefYUQO3ABsAGehH1pOjjQlIztwOhRxaWORxQ1Bdp9pxvTZiB4QITYcRcrwkPRs5uiYxLKkgfF7h7+GBorR2fREjkeS1FxZOhrzvvG1G3NLHRVV1e/UBgm/Uv8W+tPEeEy2OXkZaJFQ83HmWjNT9BDWXHdhZ/SF4wtFVe5QChZRgsE8DOvChVJDsbqFdd3zHLUaEQGrebJ+xfSJhmgxK+CCImU5uShyaYW0n0xXPTjdaIC6pMT3oRkFDOD/cJeyZKKQtRPLrMgndmpFV+Ea18wEcQfWdreS1xSr+eia1KfLsbRbqcFGpDzIu6/hExPHI2JRYNKJ1a4BYfCO6jP9E/8aGvDgF2140PpYGB2ZCmpxeLAEH7bVrutTJx9SuLK3h2dUJrmcSgqFM7azcMLOORq5LuLKRC7wChu/9/k/2aJHNWuDm3VbOkq9wxnvmNK2Fh9p09rVc6K22nkHxglVeLMUo6CR/1V5Oq72JfSOgddWMf2y5718WbUtjnHXBNua1IpWVgFIU+MyQvbXuyyvxBxszo/eyVei/cf7tt7tAPbJlGl6olCPNjA/PIfPgJvUinjBt8Azb/BC4onzB8zFL60rB27YJJ2oCgoSkNGZDM8sBL/UzTLJZPs1viDik0hO7OyBSc9iu/9KuUMu6JLUzxz5Pccy/NfBaGeB/hGd80WSNBFS9repLQ+bkc8bAnYqH1h9I27NNz/UsCZlv8Ri/DXAe/o56+TRP7/zsofE+IOCDvkGkyPBYHgJmX+GwhpjteWu82MfAK3Ebsivhp6AG4MjPW/gtx3kPMCO9LJpqvMLhICfOC0RsZiY93MX1PCWr4ZI2M3Svtbx9IOCJFGhufSDQAa+TKS3gYHJ7bVkc9VKHrmdtXRiQ+Ntfx7LyILSpABWhAZy4eFE822I4zqF9ZsKYS2B2V0BcAwklONErJ889hTXAGJYKx1tryIcJdr7e69PBZKjZ/xfiWR3oQyOuudYwCY+OH/wlhE5MPdjTqc8mDQlPlydYzHZDujZDJCKalTg7CS6yGFHu1rK+KYpbs3Ywq+w2qCl5PoqQJKgk5cecsK4aKcqr8OYVKmI+2Q8b+8QdT9m4IwDHM393q8GgZsBmYyXcZM3gFi4g09N6yK4kCltJgk3VWl1wJILdfhVIQSBm0O+DasbUMBLeC+Eq0Pvx/Q7GTj6dm1/4iMXcmuYoRv5KpvRSFVDTylOpPWRMKrz3PKBJo0w5oNka5TD+Z8wzKvaNJQUY4tfIeN0VIsgNl+dMjF+axMb+73ijZogjBvtlTYBaaRlKqa6EI/BaEjDrAMm4pf3EBZ2u8ZKf6maKFPQCZtS2xxalPpJZAoYLfik/H7puMY0t9LisUnkZbYRubxUKdkTsQ/Kb++86k2HDntQ/O/VMhTtQsGNiXKqm8tSuUCXLMfqF5gtqHB2uX5A1zeaXJYLVH36/cTRg2iBR5YqpKy9DeCzlPllAhMWjscU5nWfXQYG/B/k+f5Jh3GGK9Re6cwsQDwiRIvKt/+0+A56O9czFWrog8pVgozsmpM/r6rqpW7JjImcYQSHhaDUW/7KAJAss2lr+GRNPwNhMP7p3ijuDGSsBDy0ZxEeHCnVXdFS7KQ97Q9xylbti63j1o4ZBu8Q08+pNemDdRfBm8+wt4d59vwGjQn6nt9+Y6KG0/ZfoPvNjF8eK5jVjbcV/NOJcQFnmPD1/Kn3v2Stx6Npmsp3oIaccekXsdBHwv9IhvC10j7XqfNd7N0z6vpeTrXGMVPZtghxQnb36XL/rrK4MkUkkcLa8jveG75hbOI1d9DeRVIETD8Arrkd6tMlAchYIbk7Sjni0V3gqTyfBTPNPK3s1n0MmvFigGmRQ2ryJ+9UjJnXPn0EE1vNHzLQb5ZFIWMoIXB1ElTEiKF+rg/0W+kUjkNsvehxOSQrY2d/hJfXBKzR9gVzvpJvJVmDqakyLkABOWgv03uRjOorPpoCJ3aUwQH4z3gdBOy9RgjIebOeJQucQcBwoQjbTgWvvA6IRoXgDGhA5Flzdgj8QSZLC2XITI8VaX3oqvEoQ/SJ4hyBLtVKl3VzlcfvRombOSAAAA","wildcard":"data:image/webp;base64,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","blackhole":"data:image/webp;base64,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"};

function taxonomyBadgeMarkup(value) {
  const clean = String(value || 'Wild Card').replace(/^[^A-Za-z]+/, '').trim();
  const key = clean === 'Core Match' ? 'core'
    : clean === 'Transferable Match' ? 'transferable'
    : clean === 'Stretch Match' ? 'stretch'
    : clean === 'Black Hole' ? 'blackhole'
    : 'wildcard';
  return `<img class="taxonomy-card-image" src="${TAXONOMY_IMAGES[key]}" alt="" aria-hidden="true"><span>${clean}</span>`;
}

function recommendationLabel(result) {
  const labels = { APPLY_NOW: '🔥 APPLY NOW', APPLY: 'APPLY', STRETCH: 'STRETCH', MAYBE: 'MAYBE', REJECT: 'REJECT' };
  return labels[result.decision] || result.decision;
}

function enrich(job, i) {
  const scored = scoreJob(job);
  return {
    ...job,
    foundAt: job.foundAt || new Date(Date.now() - i * 86400000).toISOString(),
    url: job.url || '#',
    score: scored
  };
}

function renderTabs() {
  els.tabs.innerHTML = '';
  for (const [key, label] of Object.entries(STATUS_LABELS)) {
    const count = key === 'all' ? state.jobs.length : state.jobs.filter(j => getStatus(j) === key).length;
    const btn = document.createElement('button');
    btn.className = `tab ${state.status === key ? 'active' : ''}`;
    btn.textContent = `${label} ${count}`;
    btn.addEventListener('click', () => { state.status = key; render(); });
    els.tabs.appendChild(btn);
  }
}

function renderStats() {
  const actionable = state.jobs.filter(j => ['APPLY_NOW','APPLY','STRETCH'].includes(j.score.decision)).length;
  const hot = state.jobs.filter(j => j.score.priority >= 85).length;
  const applied = state.jobs.filter(j => getStatus(j) === 'applied').length;
  const interviews = state.jobs.filter(j => getStatus(j) === 'interview').length;
  const items = [['Actionable matches', actionable], ['🔥 Top priority', hot], ['Applied', applied], ['Interviews', interviews]];
  els.stats.innerHTML = items.map(([label,value]) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function renderCountries() {
  const countries = [...new Set(state.jobs.map(j => j.country).filter(Boolean))].sort();
  els.country.innerHTML = '<option value="all">All countries</option>' + countries.map(c => `<option value="${c}">${c}</option>`).join('');
  els.country.value = state.country;
}

function filteredJobs() {
  const q = state.query.trim().toLowerCase();
  return state.jobs
    .filter(j => state.status === 'all' || getStatus(j) === state.status)
    .filter(j => state.decision === 'all' || j.score.decision === state.decision)
    .filter(j => state.country === 'all' || j.country === state.country)
    .filter(j => !q || [j.title,j.company,j.city,j.country,j.description].some(v => String(v || '').toLowerCase().includes(q)))
    .sort((a,b) => {
      if (state.sort === 'fit') return b.score.fit - a.score.fit;
      if (state.sort === 'newest') return new Date(b.foundAt) - new Date(a.foundAt);
      return b.score.priority - a.score.priority;
    });
}

function renderCard(job) {
  const node = els.template.content.cloneNode(true);
  const card = node.querySelector('.job-card');
  const badge = node.querySelector('.priority-badge');
  const taxonomy = node.querySelector('.taxonomy-badge');
  const meta = [job.city, job.country, job.workModel].filter(Boolean).join(' · ');

  node.querySelector('.job-company').textContent = job.company || 'Unknown company';
  node.querySelector('.job-title').textContent = job.title;
  node.querySelector('.job-meta').textContent = meta;
  badge.textContent = recommendationLabel(job.score);
  if (taxonomy) taxonomy.innerHTML = taxonomyBadgeMarkup(job.score.taxonomy);
  if (job.score.priority >= 85 && job.score.decision !== 'REJECT') badge.classList.add('hot');
  if (job.score.decision === 'REJECT') badge.classList.add('reject');

  node.querySelector('.fit-score').textContent = `${job.score.fit}%`;
  node.querySelector('.desirability-score').textContent = `${job.score.desirability}%`;
  node.querySelector('.priority-score').textContent = `${job.score.priority}%`;
  node.querySelector('.salary-row').textContent = formatSalary(job);

  const flags = node.querySelector('.flags');
  (job.score.flags || []).forEach(flag => {
    const span = document.createElement('span'); span.className = 'flag'; span.textContent = flag; flags.appendChild(span);
  });
  if (job.score.hardReject) {
    const span = document.createElement('span'); span.className = 'flag'; span.textContent = job.score.hardReject; flags.appendChild(span);
  }

  const intel = job.score.intelligence || {};
  const pct = v => Number.isFinite(v) ? v + '%' : '—';
  node.querySelector('.tech-fit').textContent = pct(intel.techFit);
  node.querySelector('.role-fit').textContent = pct(intel.roleFit);
  node.querySelector('.seniority-fit').textContent = pct(intel.seniorityFit);
  node.querySelector('.language-fit').textContent = pct(intel.languageFit);

  const badgeList = (selector, items, type) => {
    const box = node.querySelector(selector);
    if (!items?.length) { box.innerHTML = '<span class="intel-empty">None detected</span>'; return; }
    items.forEach(item => {
      const span = document.createElement('span');
      span.className = 'intel-badge ' + type;
      span.textContent = item;
      box.appendChild(span);
    });
  };

  const techBox = node.querySelector('.tech-badges');
  const techItems = [
    ...(intel.matchedTech || []).map(x => [x,'match']),
    ...(intel.learningTech || []).map(x => [x + ' · learning','learning']),
    ...(intel.transferableTech || []).map(x => [x + ' · transferable','transfer']),
    ...(intel.techGaps || []).map(x => [x + ' · review','gap'])
  ];
  if (!techItems.length) techBox.innerHTML = '<span class="intel-empty">No named systems detected</span>';
  else techItems.forEach(([label,type]) => {
    const span = document.createElement('span');
    span.className = 'intel-badge ' + type;
    span.textContent = label;
    techBox.appendChild(span);
  });

  badgeList('.matched-badges', intel.matchedSkills, 'match');
  const langItems = (intel.mentionedLanguages || []).map(x => {
    const label = x.charAt(0).toUpperCase() + x.slice(1);
    return (intel.knownLanguages || []).includes(x) ? label : label + ' · missing';
  });
  badgeList('.language-badges', langItems, 'match');
  badgeList('.experience-badges', intel.mentionedExperience, 'transfer');
  badgeList('.gap-badges', intel.gaps, 'gap');

  const reasons = node.querySelector('.reasons-list');
  const reasonItems = job.score.reasons?.length ? job.score.reasons : ['Passed hard filters; no strong positive signal detected yet.'];
  reasonItems.forEach(r => { const li = document.createElement('li'); li.textContent = r; reasons.appendChild(li); });

  const gaps = node.querySelector('.gaps-list');
  const gapItems = job.score.gaps?.length ? job.score.gaps : ['No major keyword-level gaps flagged.'];
  gapItems.forEach(g => { const li = document.createElement('li'); li.textContent = g; gaps.appendChild(li); });

  const link = node.querySelector('.apply-link');
  link.href = job.url || '#';
  if (!job.url || job.url === '#') { link.classList.add('disabled'); link.textContent = 'No link in demo'; }

  const select = node.querySelector('.status-select');
  select.value = getStatus(job);
  select.addEventListener('change', e => setStatus(job.id, e.target.value));
  card.dataset.id = job.id;
  return node;
}

function render() {
  renderTabs();
  renderStats();
  const jobs = filteredJobs();
  els.grid.innerHTML = '';
  jobs.forEach(job => els.grid.appendChild(renderCard(job)));
  els.empty.hidden = jobs.length > 0;
}

async function init() {
  const res = await fetch('./data/sample-jobs.json');
  const jobs = await res.json();
  state.jobs = jobs.map(enrich);
  renderCountries();
  render();
}

els.search.addEventListener('input', e => { state.query = e.target.value; render(); });
els.decision.addEventListener('change', e => { state.decision = e.target.value; render(); });
els.country.addEventListener('change', e => { state.country = e.target.value; render(); });
els.sort.addEventListener('change', e => { state.sort = e.target.value; render(); });
els.reset.addEventListener('click', () => {
  localStorage.removeItem('astrojob-statuses'); state.statuses = {}; state.status = 'new'; state.query=''; state.decision='all'; state.country='all'; state.sort='priority';
  els.search.value=''; els.decision.value='all'; els.sort.value='priority'; renderCountries(); render();
});

init().catch(err => {
  els.empty.hidden = false;
  els.empty.textContent = `Could not load jobs: ${err.message}. Run this folder through GitHub Pages or a local web server.`;
});