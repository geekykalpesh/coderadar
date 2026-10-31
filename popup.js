/**
 * CodeRadar - Frontend Application Logic (ES6+ Vanilla)
 * High-performance, zero-dependency contest tracker.
 */

// Platform Registry & Metadata
const PLATFORMS_CONFIG = {
  'codeforces.com': { name: 'Codeforces', icon: 'images/codeforces.svg', color: '#3182ce' },
  'leetcode.com': { name: 'LeetCode', icon: 'images/leetcode.png', color: '#ecc94b' },
  'codechef.com': { name: 'CodeChef', icon: 'images/codechef.png', color: '#b7791f' },
  'atcoder.jp': { name: 'AtCoder', icon: 'images/atcoder.png', color: '#00b4d8' },
  'geeksforgeeks.org': { name: 'GeeksforGeeks', icon: 'images/GeeksforGeeks.svg', color: '#2f855a' },
  'hackerearth.com': { name: 'HackerEarth', icon: 'images/HackerEarth_logo.png', color: '#2b6cb0' },
  'topcoder.com': { name: 'TopCoder', icon: 'images/topcoder.png', color: '#48bb78' },
  'naukri.com/code360': { name: 'Code360', icon: 'images/naukri.jpg', color: '#e53e3e' }
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
  tabBtns: document.querySelectorAll('.tab-btn'),
  refreshBtn: document.getElementById('refreshBtn'),
  refreshIcon: document.getElementById('refreshIcon'),
  toggleFilterBtn: document.getElementById('toggleFilterBtn'),
  filterDrawer: document.getElementById('filterDrawer'),
  activeFilterBadge: document.getElementById('activeFilterBadge'),
  platformChipsContainer: document.getElementById('platformChipsContainer'),
  selectAllPlatformsBtn: document.getElementById('selectAllPlatformsBtn'),
  clearPlatformsBtn: document.getElementById('clearPlatformsBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  reminderOffsetSelect: document.getElementById('reminderOffsetSelect'),
  hideLongContestsSwitch: document.getElementById('hideLongContestsSwitch'),
  clistUsernameInput: document.getElementById('clistUsernameInput'),
  clistApiKeyInput: document.getElementById('clistApiKeyInput'),
  syncStatus: document.getElementById('syncStatus'),
  countAll: document.getElementById('countAll'),
  countLive: document.getElementById('countLive'),
  countToday: document.getElementById('countToday'),
  countUpcoming: document.getElementById('countUpcoming'),
  countSaved: document.getElementById('countSaved')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadStoredData();
  renderPlatformChips();
  renderContests();

  // Fetch latest data in background or if cache is empty
  const shouldFetch = state.contests.length === 0;
  await fetchContests(shouldFetch);
});

/**
 * Load settings, bookmarks, and cached contests from chrome.storage.local
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
      elements.syncStatus.textContent = 'Loaded from cache';
    }
  } catch (err) {
    console.warn('[CodeRadar] Error reading local storage:', err);
  }
}

/**
 * Attach UI event listeners
 */
function setupEventListeners() {
  // Search
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

  // Tab Navigation
  elements.tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      elements.tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeTab = btn.dataset.tab;
      renderContests();
    });
  });

  // Filter Drawer Toggle
  elements.toggleFilterBtn.addEventListener('click', () => {
    elements.filterDrawer.classList.toggle('hidden');
    elements.toggleFilterBtn.classList.toggle('active', !elements.filterDrawer.classList.contains('hidden'));
  });

  // Platform bulk actions
  elements.selectAllPlatformsBtn.addEventListener('click', async () => {
    state.selectedPlatforms = Object.keys(PLATFORMS_CONFIG);
    await persistSelectedPlatforms();
    renderPlatformChips();
    renderContests();
    fetchContests(true);
  });

  elements.clearPlatformsBtn.addEventListener('click', async () => {
    state.selectedPlatforms = [];
    await persistSelectedPlatforms();
    renderPlatformChips();
    renderContests();
  });

  // Refresh
  elements.refreshBtn.addEventListener('click', async () => {
    elements.refreshIcon.classList.add('spin');
    await fetchContests(true);
    setTimeout(() => elements.refreshIcon.classList.remove('spin'), 800);
  });

  // Settings Modal
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

  // Click outside modal to close
  elements.settingsModal.addEventListener('click', (e) => {
    if (e.target === elements.settingsModal) {
      elements.settingsModal.classList.add('hidden');
    }
  });
}

/**
 * Render platform toggle chips with active counts
 */
function renderPlatformChips() {
  elements.activeFilterBadge.textContent = state.selectedPlatforms.length;
  elements.platformChipsContainer.innerHTML = '';

  Object.entries(PLATFORMS_CONFIG).forEach(([resource, conf]) => {
    const isSelected = state.selectedPlatforms.includes(resource);
    const count = state.contests.filter((c) => c.resource === resource).length;

    const chip = document.createElement('button');
    chip.className = `platform-chip ${isSelected ? 'selected' : ''}`;
    chip.innerHTML = `
      <img src="${conf.icon}" alt="${conf.name}" />
      <span>${conf.name}</span>
      <span class="chip-count">${count}</span>
    `;

    chip.addEventListener('click', async () => {
      if (isSelected) {
        state.selectedPlatforms = state.selectedPlatforms.filter((r) => r !== resource);
      } else {
        state.selectedPlatforms.push(resource);
      }
      await persistSelectedPlatforms();
      renderPlatformChips();
      renderContests();
      fetchContests(true);
    });

    elements.platformChipsContainer.appendChild(chip);
  });
}

async function persistSelectedPlatforms() {
  state.settings.selectedPlatforms = state.selectedPlatforms;
  await chrome.storage.local.set({ settings: state.settings });
}

/**
 * Fetch contests from CLIST API with automatic fallback
 */
async function fetchContests(showSpinner = false) {
  if (state.isLoading) return;
  state.isLoading = true;

  if (showSpinner && state.contests.length === 0) {
    elements.contestList.innerHTML = `
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    `;
  }

  elements.syncStatus.textContent = 'Scanning contests...';

  try {
    const username = state.settings.customClistUsername || 'karanarjunjr';
    const apiKey = state.settings.customClistApiKey || '32b0dc3d2ed2ee0e8ad5eb7dfe37c47e4da8abb4';
    const resources = state.selectedPlatforms.length > 0 ? state.selectedPlatforms : Object.keys(PLATFORMS_CONFIG);

    const now = new Date();
    const nowIso = now.toISOString().substring(0, 19);

    const url = `https://clist.by:443/api/v4/contest/?username=${username}&api_key=${apiKey}&format=json&order_by=start&limit=100&end__gt=${nowIso}&resource__in=${encodeURIComponent(resources.join(','))}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Clist HTTP ${res.status}`);
    }

    const data = await res.json();
    const fetchedContests = data.objects || [];

    state.contests = fetchedContests;
    await chrome.storage.local.set({
      contests: fetchedContests,
      lastSynced: Date.now()
    });

    elements.syncStatus.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    renderPlatformChips();
    renderContests();
  } catch (err) {
    console.warn('[CodeRadar] Clist fetch error, attempting fallback:', err);
    elements.syncStatus.textContent = 'Sync issue (offline/rate-limited)';
    // If no contests at all, try official Codeforces fallback
    if (state.contests.length === 0) {
      await tryCodeforcesFallback();
    }
  } finally {
    state.isLoading = false;
  }
}

/**
 * Resilient fallback: Direct official Codeforces API
 */
async function tryCodeforcesFallback() {
  try {
    elements.syncStatus.textContent = 'Using Codeforces direct fallback...';
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
      elements.syncStatus.textContent = 'Synced via Codeforces Direct API';
    }
  } catch (cfErr) {
    console.error('[CodeRadar] Fallback failed:', cfErr);
  }
}

/**
 * Filter contests according to active tab, selected platforms, duration, and search
 */
function getFilteredContests() {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return state.contests.filter((contest) => {
    // Platform filter
    if (state.selectedPlatforms.length > 0 && !state.selectedPlatforms.includes(contest.resource)) {
      return false;
    }

    // Duration filter (> 24 hours = 86400 seconds)
    if (state.settings.hideLongContests && contest.duration > 86400) {
      return false;
    }

    // Search query filter
    if (state.searchQuery) {
      const titleMatch = contest.event.toLowerCase().includes(state.searchQuery);
      const resourceMatch = contest.resource.toLowerCase().includes(state.searchQuery);
      if (!titleMatch && !resourceMatch) return false;
    }

    const start = new Date(contest.start.endsWith('Z') ? contest.start : contest.start + '.000Z');
    const end = new Date(contest.end.endsWith('Z') ? contest.end : contest.end + '.000Z');

    // Tab filter
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

    return end > now; // 'all' tab shows everything currently active or upcoming
  });
}

/**
 * Update tab counts
 */
function updateTabCounts() {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  let live = 0;
  let today = 0;
  let upcoming = 0;
  let all = 0;

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
 * Main render function
 */
function renderContests() {
  updateTabCounts();
  const filtered = getFilteredContests();

  if (filtered.length === 0) {
    elements.contestList.innerHTML = renderEmptyState();
    return;
  }

  const html = filtered.map((contest) => createContestCardHtml(contest)).join('');
  elements.contestList.innerHTML = html;

  attachCardActionListeners();
}

/**
 * Render Empty State HTML
 */
function renderEmptyState() {
  let title = 'No contests found';
  let desc = 'Try expanding your platform filters or clearing your search.';

  if (state.activeTab === 'live') {
    title = 'No live contests right now';
    desc = 'Check the Today or Upcoming tabs to see what rounds are coming next!';
  } else if (state.activeTab === 'saved') {
    title = 'No starred contests';
    desc = 'Click the ⭐ star on any contest to bookmark it here for quick access.';
  } else if (state.searchQuery) {
    title = 'No search results';
    desc = `No contests match "${escapeHtml(state.searchQuery)}".`;
  }

  return `
    <div class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <div class="empty-title">${title}</div>
      <p class="empty-desc">${desc}</p>
    </div>
  `;
}

/**
 * Generate HTML string for single contest card
 */
function createContestCardHtml(contest) {
  const conf = PLATFORMS_CONFIG[contest.resource] || { name: contest.resource, icon: 'logo/icon16.png' };
  const now = new Date();
  const start = new Date(contest.start.endsWith('Z') ? contest.start : contest.start + '.000Z');
  const end = new Date(contest.end.endsWith('Z') ? contest.end : contest.end + '.000Z');

  const isLive = start <= now && end >= now;
  const isBookmarked = state.bookmarkedIds.includes(contest.id);
  const hasReminder = Boolean(state.reminders && state.reminders[contest.id]);

  // Relative status text
  let statusBadgeHtml = '';
  if (isLive) {
    const timeLeft = formatDuration((end.getTime() - now.getTime()) / 1000);
    statusBadgeHtml = `<span class="status-badge live"><span class="pulse-indicator"></span> LIVE • Ends in ${timeLeft}</span>`;
  } else {
    const diffSec = (start.getTime() - now.getTime()) / 1000;
    if (diffSec < 86400) {
      statusBadgeHtml = `<span class="status-badge today">⚡ Starts in ${formatDuration(diffSec)}</span>`;
    } else {
      const days = Math.floor(diffSec / 86400);
      statusBadgeHtml = `<span class="status-badge upcoming">🟢 In ${days}d ${Math.floor((diffSec % 86400) / 3600)}h</span>`;
    }
  }

  // Format local date/time
  const localDateStr = start.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const localTimeStr = start.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  });

  const durationStr = formatDuration(contest.duration);
  const gcalUrl = createGoogleCalendarUrl(contest, start, end);

  return `
    <article class="contest-card ${isLive ? 'live-border' : ''}" data-id="${contest.id}">
      <div class="card-header">
        <div class="platform-pill">
          <img src="${conf.icon}" alt="${conf.name}" class="platform-icon" />
          <span>${conf.name}</span>
        </div>
        ${statusBadgeHtml}
      </div>

      <a href="${escapeHtml(contest.href)}" target="_blank" rel="noopener" class="contest-title" title="${escapeHtml(contest.event)}">
        ${escapeHtml(contest.event)}
      </a>

      <div class="contest-details">
        <div class="detail-item" title="Local Date and Time">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>${localDateStr} • ${localTimeStr}</span>
        </div>

        <div class="detail-item" title="Contest Duration">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>${durationStr}</span>
        </div>
      </div>

      <div class="card-actions">
        <div class="action-buttons-left">
          <!-- Add to Calendar -->
          <a href="${gcalUrl}" target="_blank" rel="noopener" class="action-btn" title="Add to Google Calendar">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
            <span>Sync</span>
          </a>

          <!-- Reminder Alarm -->
          <button class="action-btn reminder-btn ${hasReminder ? 'active-bell' : ''}" data-id="${contest.id}" title="${hasReminder ? 'Cancel Reminder' : 'Set Desktop Alert'}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="${hasReminder ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>${hasReminder ? 'Alert Set' : 'Remind'}</span>
          </button>

          <!-- Star Bookmark -->
          <button class="action-btn star-btn ${isBookmarked ? 'active-star' : ''}" data-id="${contest.id}" title="${isBookmarked ? 'Remove Star' : 'Star Contest'}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
        </div>

        <a href="${escapeHtml(contest.href)}" target="_blank" rel="noopener" class="enter-link">
          <span>Participate</span>
          &rarr;
        </a>
      </div>
    </article>
  `;
}

/**
 * Attach click handlers for dynamically created contest card actions
 */
function attachCardActionListeners() {
  // Star button
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

  // Reminder button
  document.querySelectorAll('.reminder-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const contest = state.contests.find((c) => String(c.id) === String(id));
      if (!contest) return;

      const hasReminder = Boolean(state.reminders && state.reminders[id]);
      if (hasReminder) {
        // Cancel reminder
        delete state.reminders[id];
        chrome.runtime.sendMessage({ action: 'cancelReminder', contestId: id });
      } else {
        // Schedule reminder
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
 * Format duration in seconds to "Xh Ym" or "Xd Xh"
 */
function formatDuration(sec) {
  const totalMin = Math.floor(sec / 60);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${mins > 0 ? mins + 'm' : ''}`.trim();
  }
  return `${mins}m`;
}

/**
 * Construct pre-filled Google Calendar event URL
 */
function createGoogleCalendarUrl(contest, startDate, endDate) {
  const pad = (n) => String(n).padStart(2, '0');
  const toUtcString = (d) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const startUtc = toUtcString(startDate);
  const endUtc = toUtcString(endDate);

  const title = encodeURIComponent(`[${contest.resource}] ${contest.event}`);
  const details = encodeURIComponent(
    `Contest: ${contest.event}\nPlatform: ${contest.resource}\nLink: ${contest.href}\n\nAdded via CodeRadar`
  );
  const location = encodeURIComponent(contest.href);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;
}

/**
 * HTML Escaping utility to prevent injection
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
