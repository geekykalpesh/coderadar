/**
 * CodeRadar - Frontend Application Logic (ES6+ Vanilla)
 * High-performance, clean, robust contest tracker.
 */

// Supported Platforms Configuration
const PLATFORMS_CONFIG = {
  'codeforces.com': { name: 'Codeforces', icon: 'images/codeforces.svg' },
  'leetcode.com': { name: 'LeetCode', icon: 'images/leetcode.png' },
  'codechef.com': { name: 'CodeChef', icon: 'images/codechef.png' },
  'atcoder.jp': { name: 'AtCoder', icon: 'images/atcoder.png' },
  'geeksforgeeks.org': { name: 'GeeksforGeeks', icon: 'images/GeeksforGeeks.svg' },
  'hackerearth.com': { name: 'HackerEarth', icon: 'images/HackerEarth_logo.png' },
  'topcoder.com': { name: 'TopCoder', icon: 'images/topcoder.png' },
  'naukri.com/code360': { name: 'Code360', icon: 'images/naukri.jpg' }
};

// Application State
const state = {
  contests: [],
  activeTab: 'all',
  searchQuery: '',
  selectedPlatforms: Object.keys(PLATFORMS_CONFIG),
  bookmarkedIds: [],
  reminders: {}, // contestId -> details
  settings: {
    reminderMinutes: 15,
    hideLongContests: true,
    customClistUsername: '',
    customClistApiKey: ''
  },
  isLoading: false
};

// DOM References
const elements = {
  contestList: document.getElementById('contestList'),
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  tabItems: document.querySelectorAll('.tab-item'),
  refreshBtn: document.getElementById('refreshBtn'),
  refreshIcon: document.getElementById('refreshIcon'),
  platformChipsContainer: document.getElementById('platformChipsContainer'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  reminderOffsetSelect: document.getElementById('reminderOffsetSelect'),
  hideLongContestsSwitch: document.getElementById('hideLongContestsSwitch'),
  clistUsernameInput: document.getElementById('clistUsernameInput'),
  clistApiKeyInput: document.getElementById('clistApiKeyInput'),
  syncStatus: document.getElementById('syncStatus'),
  contestCountDisplay: document.getElementById('contestCountDisplay'),
  countAll: document.getElementById('countAll'),
  countLive: document.getElementById('countLive'),
  countToday: document.getElementById('countToday'),
  countUpcoming: document.getElementById('countUpcoming'),
  countSaved: document.getElementById('countSaved')
};

// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadStoredData();
  renderPlatformChips();
  renderContests();

  // Background sync if cache is empty
  const shouldFetch = state.contests.length === 0;
  await fetchContests(shouldFetch);
});

/**
 * Load settings, bookmarks, and cached contests from local storage
 */
async function loadStoredData() {
  try {
    const data = await chrome.storage.local.get(['contests', 'settings', 'bookmarkedIds']);

    if (data.settings) {
      state.settings = { ...state.settings, ...data.settings };
      if (Array.isArray(data.settings.selectedPlatforms) && data.settings.selectedPlatforms.length > 0) {
        state.selectedPlatforms = data.settings.selectedPlatforms;
      }
      if (data.settings.reminders) {
        state.reminders = data.settings.reminders;
      }
    }

    if (data.bookmarkedIds) {
      state.bookmarkedIds = data.bookmarkedIds;
    }

    if (Array.isArray(data.contests) && data.contests.length > 0) {
      state.contests = data.contests;
      elements.syncStatus.textContent = 'Synced from local cache';
    }
  } catch (err) {
    console.warn('[CodeRadar] Local storage read error:', err);
  }
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Live Search
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    elements.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
    renderContests();
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.clearSearchBtn.style.display = 'none';
    renderContests();
  });

  // Segmented Tabs
  elements.tabItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      elements.tabItems.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeTab = btn.dataset.tab;
      renderContests();
    });
  });

  // Refresh Button
  elements.refreshBtn.addEventListener('click', async () => {
    elements.refreshIcon.classList.add('spin');
    await fetchContests(true);
    setTimeout(() => elements.refreshIcon.classList.remove('spin'), 750);
  });

  // Settings Dialog
  elements.settingsBtn.addEventListener('click', () => {
    elements.reminderOffsetSelect.value = state.settings.reminderMinutes || 15;
    elements.hideLongContestsSwitch.checked = state.settings.hideLongContests !== false;
    elements.clistUsernameInput.value = state.settings.customClistUsername || '';
    elements.clistApiKeyInput.value = state.settings.customClistApiKey || '';
    elements.settingsModal.classList.remove('hidden');
  });

  elements.closeSettingsBtn.addEventListener('click', () => {
    elements.settingsModal.classList.add('hidden');
  });

  elements.saveSettingsBtn.addEventListener('click', async () => {
    state.settings.reminderMinutes = parseInt(elements.reminderOffsetSelect.value, 10);
    state.settings.hideLongContests = elements.hideLongContestsSwitch.checked;
    state.settings.customClistUsername = elements.clistUsernameInput.value.trim();
    state.settings.customClistApiKey = elements.clistApiKeyInput.value.trim();

    await chrome.storage.local.set({ settings: state.settings });
    elements.settingsModal.classList.add('hidden');
    renderContests();
    fetchContests(true);
  });

  elements.settingsModal.addEventListener('click', (e) => {
    if (e.target === elements.settingsModal) {
      elements.settingsModal.classList.add('hidden');
    }
  });
}

/**
 * Render Horizontal Platform Filter Chips
 */
function renderPlatformChips() {
  elements.platformChipsContainer.innerHTML = '';

  Object.entries(PLATFORMS_CONFIG).forEach(([resource, conf]) => {
    const isSelected = state.selectedPlatforms.includes(resource);
    const count = state.contests.filter((c) => c.resource === resource).length;

    const chip = document.createElement('button');
    chip.className = `platform-chip ${isSelected ? 'selected' : ''}`;
    chip.innerHTML = `
      <img src="${conf.icon}" alt="${conf.name}" />
      <span>${conf.name}</span>
      <span class="chip-counter">${count}</span>
    `;

    chip.addEventListener('click', async () => {
      if (isSelected) {
        state.selectedPlatforms = state.selectedPlatforms.filter((r) => r !== resource);
      } else {
        state.selectedPlatforms.push(resource);
      }
      await chrome.storage.local.set({
        settings: { ...state.settings, selectedPlatforms: state.selectedPlatforms }
      });
      renderPlatformChips();
      renderContests();
      fetchContests(true);
    });

    elements.platformChipsContainer.appendChild(chip);
  });
}

/**
 * Fetch Contest Schedules
 */
async function fetchContests(showSkeleton = false) {
  if (state.isLoading) return;
  state.isLoading = true;

  if (showSkeleton && state.contests.length === 0) {
    elements.contestList.innerHTML = `
      <div class="skeleton-item"></div>
      <div class="skeleton-item"></div>
      <div class="skeleton-item"></div>
    `;
  }

  elements.syncStatus.textContent = 'Updating schedule...';

  try {
    const username = state.settings.customClistUsername || 'karanarjunjr';
    const apiKey = state.settings.customClistApiKey || '32b0dc3d2ed2ee0e8ad5eb7dfe37c47e4da8abb4';
    const resources = state.selectedPlatforms.length > 0 ? state.selectedPlatforms : Object.keys(PLATFORMS_CONFIG);

    const now = new Date();
    const nowIso = now.toISOString().substring(0, 19);

    const url = `https://clist.by:443/api/v4/contest/?username=${username}&api_key=${apiKey}&format=json&order_by=start&limit=100&end__gt=${nowIso}&resource__in=${encodeURIComponent(resources.join(','))}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const fetched = data.objects || [];

    state.contests = fetched;
    await chrome.storage.local.set({
      contests: fetched,
      lastSynced: Date.now()
    });

    elements.syncStatus.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    renderPlatformChips();
    renderContests();
  } catch (err) {
    console.warn('[CodeRadar] Clist sync error, trying Codeforces fallback:', err);
    elements.syncStatus.textContent = 'Sync issue (offline/rate-limited)';
    if (state.contests.length === 0) {
      await tryCodeforcesFallback();
    }
  } finally {
    state.isLoading = false;
  }
}

/**
 * Direct official Codeforces fallback
 */
async function tryCodeforcesFallback() {
  try {
    elements.syncStatus.textContent = 'Codeforces Direct fallback active';
    const cfRes = await fetch('https://codeforces.com/api/contest.list?gym=false');
    const cfData = await cfRes.json();

    if (cfData.status === 'OK' && Array.isArray(cfData.result)) {
      const nowSec = Math.floor(Date.now() / 1000);
      const upcoming = cfData.result
        .filter((c) => c.phase === 'BEFORE' || (c.startTimeSeconds && c.startTimeSeconds + c.durationSeconds > nowSec))
        .reverse()
        .slice(0, 25)
        .map((c) => ({
          id: `cf_${c.id}`,
          event: c.name,
          resource: 'codeforces.com',
          href: `https://codeforces.com/contest/${c.id}`,
          start: new Date(c.startTimeSeconds * 1000).toISOString().substring(0, 19),
          end: new Date((c.startTimeSeconds + c.durationSeconds) * 1000).toISOString().substring(0, 19),
          duration: c.durationSeconds
        }));

      state.contests = upcoming;
      renderPlatformChips();
      renderContests();
      elements.syncStatus.textContent = 'Live via Codeforces Official API';
    }
  } catch (cfErr) {
    console.error('[CodeRadar] Fallback failed:', cfErr);
  }
}

/**
 * Filter contests based on active tab, search query, platform, and duration
 */
function getFilteredContests() {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return state.contests.filter((contest) => {
    // Platform selection
    if (state.selectedPlatforms.length > 0 && !state.selectedPlatforms.includes(contest.resource)) {
      return false;
    }

    // Hide long hackathons (> 24 hours)
    if (state.settings.hideLongContests && contest.duration > 86400) {
      return false;
    }

    // Search query
    if (state.searchQuery) {
      const matchTitle = contest.event.toLowerCase().includes(state.searchQuery);
      const matchResource = contest.resource.toLowerCase().includes(state.searchQuery);
      if (!matchTitle && !matchResource) return false;
    }

    const start = new Date(contest.start.endsWith('Z') ? contest.start : contest.start + '.000Z');
    const end = new Date(contest.end.endsWith('Z') ? contest.end : contest.end + '.000Z');

    if (state.activeTab === 'live') {
      return start <= now && end >= now;
    }
    if (state.activeTab === 'today') {
      return (start > now && start <= next24h) || (start <= now && end >= now);
    }
    if (state.activeTab === 'upcoming') {
      return start > next24h;
    }
    if (state.activeTab === 'saved') {
      return state.bookmarkedIds.includes(contest.id);
    }

    return end > now;
  });
}

/**
 * Update tab counts
 */
function updateTabCounts() {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  let live = 0, today = 0, upcoming = 0, all = 0;

  state.contests.forEach((c) => {
    if (state.selectedPlatforms.length > 0 && !state.selectedPlatforms.includes(c.resource)) return;
    if (state.settings.hideLongContests && c.duration > 86400) return;

    const start = new Date(c.start.endsWith('Z') ? c.start : c.start + '.000Z');
    const end = new Date(c.end.endsWith('Z') ? c.end : c.end + '.000Z');

    if (end > now) {
      all++;
      if (start <= now && end >= now) live++;
      else if (start > now && start <= next24h) today++;
      else if (start > next24h) upcoming++;
    }
  });

  elements.countAll.textContent = all;
  elements.countLive.textContent = live;
  elements.countToday.textContent = today;
  elements.countUpcoming.textContent = upcoming;
  elements.countSaved.textContent = state.bookmarkedIds.length;
}

/**
 * Main Render Pipeline
 */
function renderContests() {
  updateTabCounts();
  const filtered = getFilteredContests();
  elements.contestCountDisplay.textContent = `${filtered.length} contest${filtered.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    elements.contestList.innerHTML = renderEmptyState();
    return;
  }

  const html = filtered.map((c) => createContestCardHtml(c)).join('');
  elements.contestList.innerHTML = html;

  attachCardActionListeners();
}

/**
 * Clean Empty State View
 */
function renderEmptyState() {
  let title = 'No contests found';
  let desc = 'Try selecting more platforms or clearing your search query.';

  if (state.activeTab === 'live') {
    title = 'No live contests right now';
    desc = 'Check the Today or Upcoming tabs to see what rounds start next.';
  } else if (state.activeTab === 'saved') {
    title = 'No starred contests';
    desc = 'Star any contest using the bookmark button to pin it here.';
  } else if (state.searchQuery) {
    title = 'No search results';
    desc = `No contests match "${escapeHtml(state.searchQuery)}".`;
  }

  return `
    <div class="empty-view">
      <svg class="empty-view-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <div class="empty-view-title">${title}</div>
      <p class="empty-view-desc">${desc}</p>
    </div>
  `;
}

/**
 * High-Legibility Contest Card HTML
 */
function createContestCardHtml(contest) {
  const conf = PLATFORMS_CONFIG[contest.resource] || { name: contest.resource, icon: 'logo/icon16.png' };
  const now = new Date();
  const start = new Date(contest.start.endsWith('Z') ? contest.start : contest.start + '.000Z');
  const end = new Date(contest.end.endsWith('Z') ? contest.end : contest.end + '.000Z');

  const isLive = start <= now && end >= now;
  const isBookmarked = state.bookmarkedIds.includes(contest.id);
  const hasReminder = Boolean(state.reminders && state.reminders[contest.id]);

  // Clean status badge
  let statusBadgeHtml = '';
  if (isLive) {
    const timeLeft = formatDuration((end.getTime() - now.getTime()) / 1000);
    statusBadgeHtml = `<span class="status-pill pill-live"><span class="live-dot-pulse"></span> LIVE • Ends in ${timeLeft}</span>`;
  } else {
    const diffSec = (start.getTime() - now.getTime()) / 1000;
    if (diffSec < 86400) {
      statusBadgeHtml = `<span class="status-pill pill-today">⚡ Starts in ${formatDuration(diffSec)}</span>`;
    } else {
      const days = Math.floor(diffSec / 86400);
      const hours = Math.floor((diffSec % 86400) / 3600);
      statusBadgeHtml = `<span class="status-pill pill-upcoming">🟢 In ${days}d ${hours}h</span>`;
    }
  }

  // Friendly human readable date formatting
  const isToday = start.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = start.toDateString() === tomorrow.toDateString();

  let datePrefix = '';
  if (isToday) datePrefix = 'Today';
  else if (isTomorrow) datePrefix = 'Tomorrow';
  else {
    datePrefix = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  const timeString = start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const durationString = formatDuration(contest.duration);
  const gcalUrl = createGoogleCalendarUrl(contest, start, end);

  return `
    <article class="contest-card ${isLive ? 'card-live' : ''}" data-id="${contest.id}">
      <div class="card-header-row">
        <div class="platform-identity">
          <img src="${conf.icon}" alt="${conf.name}" class="platform-logo-img" />
          <span class="platform-name">${conf.name}</span>
        </div>
        ${statusBadgeHtml}
      </div>

      <a href="${escapeHtml(contest.href)}" target="_blank" rel="noopener" class="contest-headline">
        ${escapeHtml(contest.event)}
      </a>

      <div class="schedule-row">
        <div class="schedule-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span><strong>${datePrefix}</strong> at ${timeString}</span>
        </div>

        <div class="schedule-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Duration: ${durationString}</span>
        </div>
      </div>

      <div class="card-footer-row">
        <div class="actions-cluster">
          <!-- Add to Calendar -->
          <a href="${gcalUrl}" target="_blank" rel="noopener" class="btn-utility" title="Sync with Google Calendar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
            <span>+ Calendar</span>
          </a>

          <!-- Alert Reminder -->
          <button class="btn-utility reminder-btn ${hasReminder ? 'active-bell' : ''}" data-id="${contest.id}" title="${hasReminder ? 'Cancel Alert' : 'Set 15m Desktop Alert'}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="${hasReminder ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>${hasReminder ? 'Alert Set' : 'Remind'}</span>
          </button>

          <!-- Star Bookmark -->
          <button class="btn-utility star-btn ${isBookmarked ? 'active-star' : ''}" data-id="${contest.id}" title="${isBookmarked ? 'Remove Star' : 'Star Contest'}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
        </div>

        <a href="${escapeHtml(contest.href)}" target="_blank" rel="noopener" class="link-participate">
          <span>Participate</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>
      </div>
    </article>
  `;
}

/**
 * Attach Card Action Listeners
 */
function attachCardActionListeners() {
  document.querySelectorAll('.star-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id, 10) || btn.dataset.id;
      if (state.bookmarkedIds.includes(id)) {
        state.bookmarkedIds = state.bookmarkedIds.filter((bid) => bid !== id);
      } else {
        state.bookmarkedIds.push(id);
      }
      await chrome.storage.local.set({ bookmarkedIds: state.bookmarkedIds });
      renderContests();
    });
  });

  document.querySelectorAll('.reminder-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const contest = state.contests.find((c) => String(c.id) === String(id));
      if (!contest) return;

      const hasReminder = Boolean(state.reminders && state.reminders[id]);
      if (hasReminder) {
        delete state.reminders[id];
        chrome.runtime.sendMessage({ action: 'cancelReminder', contestId: id });
      } else {
        if (!state.reminders) state.reminders = {};
        state.reminders[id] = {
          id: contest.id,
          event: contest.event,
          start: contest.start,
          resource: contest.resource,
          href: contest.href
        };
        chrome.runtime.sendMessage({
          action: 'scheduleReminder',
          contest: contest,
          minutesBefore: state.settings.reminderMinutes || 15
        });
      }

      await chrome.storage.local.set({ settings: state.settings });
      renderContests();
    });
  });
}

/**
 * Format Duration Helper
 */
function formatDuration(sec) {
  const totalMin = Math.floor(sec / 60);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins > 0 ? mins + 'm' : ''}`.trim();
  return `${mins}m`;
}

/**
 * Construct Google Calendar URL
 */
function createGoogleCalendarUrl(contest, startDate, endDate) {
  const pad = (n) => String(n).padStart(2, '0');
  const toUtc = (d) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const startUtc = toUtc(startDate);
  const endUtc = toUtc(endDate);

  const title = encodeURIComponent(`[${contest.resource}] ${contest.event}`);
  const details = encodeURIComponent(
    `Contest: ${contest.event}\nPlatform: ${contest.resource}\nLink: ${contest.href}\n\nAdded via CodeRadar`
  );
  const location = encodeURIComponent(contest.href);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;
}

/**
 * HTML Sanitizer
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
