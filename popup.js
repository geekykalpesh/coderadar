/**
 * CodeRadar - Premium Frontend Engine (ES6+ Vanilla)
 * Keyboard-first navigation, live Codeforces profile tracker, multi-calendar export, and personalized themes.
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

// Codeforces Rank Colors
const CF_RANK_COLORS = {
  'newbie': '#9ca3af',
  'pupil': '#34d399',
  'specialist': '#38bdf8',
  'expert': '#60a5fa',
  'candidate master': '#c084fc',
  'master': '#fb923c',
  'international master': '#fb923c',
  'grandmaster': '#ef4444',
  'international grandmaster': '#ef4444',
  'legendary grandmaster': '#ef4444'
};

// Application State
const state = {
  contests: [],
  activeTab: 'all',
  activeDurFilter: 'all', // 'all', 'short', 'medium', 'long'
  searchQuery: '',
  selectedPlatforms: Object.keys(PLATFORMS_CONFIG),
  bookmarkedIds: [],
  reminders: {}, // contestId -> details
  selectedCardIndex: -1,
  activeCalendarContest: null,
  cfProfile: null,
  settings: {
    cfHandle: '',
    reminderMinutes: 15,
    hideLongContests: true,
    timeFormat: '12', // '12' or '24'
    themeAccent: 'cyan', // 'cyan', 'emerald', 'violet', 'amber'
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
  durPills: document.querySelectorAll('.dur-pill'),
  refreshBtn: document.getElementById('refreshBtn'),
  refreshIcon: document.getElementById('refreshIcon'),
  platformChipsContainer: document.getElementById('platformChipsContainer'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  reminderOffsetSelect: document.getElementById('reminderOffsetSelect'),
  timeFormatSelect: document.getElementById('timeFormatSelect'),
  hideLongContestsSwitch: document.getElementById('hideLongContestsSwitch'),
  clistUsernameInput: document.getElementById('clistUsernameInput'),
  clistApiKeyInput: document.getElementById('clistApiKeyInput'),
  syncStatus: document.getElementById('syncStatus'),
  contestCountDisplay: document.getElementById('contestCountDisplay'),
  tzDisplay: document.getElementById('tzDisplay'),
  countAll: document.getElementById('countAll'),
  countLive: document.getElementById('countLive'),
  countToday: document.getElementById('countToday'),
  countUpcoming: document.getElementById('countUpcoming'),
  countSaved: document.getElementById('countSaved'),
  // Profile elements
  profileHud: document.getElementById('profileHud'),
  profilePrompt: document.getElementById('profilePrompt'),
  handleForm: document.getElementById('handleForm'),
  handleInput: document.getElementById('handleInput'),
  addHandleBtn: document.getElementById('addHandleBtn'),
  saveHandleBtn: document.getElementById('saveHandleBtn'),
  cancelHandleBtn: document.getElementById('cancelHandleBtn'),
  editHandleBtn: document.getElementById('editHandleBtn'),
  userAvatar: document.getElementById('userAvatar'),
  userHandle: document.getElementById('userHandle'),
  userRankBadge: document.getElementById('userRankBadge'),
  userRating: document.getElementById('userRating'),
  userMaxRating: document.getElementById('userMaxRating'),
  // Calendar popover
  calendarPopover: document.getElementById('calendarPopover'),
  calGoogleBtn: document.getElementById('calGoogleBtn'),
  calOutlookBtn: document.getElementById('calOutlookBtn'),
  calIcsBtn: document.getElementById('calIcsBtn'),
  // Theme dots
  accentDots: document.querySelectorAll('.accent-dot')
};

// Application Bootstrap
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  setupKeyboardShortcuts();
  detectTimezone();
  await loadStoredData();
  applyThemeAccent(state.settings.themeAccent || 'cyan');
  renderPlatformChips();
  renderContests();

  // If handle saved, refresh profile in background
  if (state.settings.cfHandle) {
    refreshCfProfile(state.settings.cfHandle);
  }

  // Sync contests if cache is empty
  const shouldFetch = state.contests.length === 0;
  await fetchContests(shouldFetch);
});

/**
 * Detect Local Timezone
 */
function detectTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const shortTz = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2] || 'UTC';
    elements.tzDisplay.textContent = shortTz;
    elements.tzDisplay.title = `Timezone: ${tz}`;
  } catch (e) {
    elements.tzDisplay.textContent = 'LOCAL';
  }
}

/**
 * Apply Theme Accent Class
 */
function applyThemeAccent(accent) {
  document.body.classList.remove('theme-cyan', 'theme-emerald', 'theme-violet', 'theme-amber');
  if (accent !== 'cyan') {
    document.body.classList.add(`theme-${accent}`);
  }
  elements.accentDots.forEach((dot) => {
    dot.classList.toggle('active', dot.dataset.accent === accent);
  });
}

/**
 * Load Persistent State from chrome.storage.local
 */
async function loadStoredData() {
  try {
    const data = await chrome.storage.local.get(['contests', 'settings', 'bookmarkedIds', 'cfProfile']);

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

    if (data.cfProfile) {
      state.cfProfile = data.cfProfile;
      renderProfileHud(data.cfProfile);
    } else if (state.settings.cfHandle) {
      renderProfilePrompt(false);
    }

    if (Array.isArray(data.contests) && data.contests.length > 0) {
      state.contests = data.contests;
      elements.syncStatus.textContent = 'Synced from local cache';
    }
  } catch (err) {
    console.warn('[CodeRadar] Storage read error:', err);
  }
}

/**
 * Codeforces Profile HUD Pipeline
 */
async function refreshCfProfile(handle) {
  if (!handle) return;
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`);
    const data = await res.json();
    if (data.status === 'OK' && Array.isArray(data.result) && data.result.length > 0) {
      const u = data.result[0];
      const profile = {
        handle: u.handle,
        rating: u.rating || 0,
        maxRating: u.maxRating || 0,
        rank: u.rank || 'unrated',
        maxRank: u.maxRank || 'unrated',
        titlePhoto: u.titlePhoto
      };
      state.cfProfile = profile;
      await chrome.storage.local.set({ cfProfile: profile });
      renderProfileHud(profile);
    }
  } catch (err) {
    console.warn('[CodeRadar] Failed to fetch Codeforces profile:', err);
  }
}

function renderProfileHud(profile) {
  elements.profilePrompt.classList.add('hidden');
  elements.handleForm.classList.add('hidden');
  elements.profileHud.classList.remove('hidden');

  elements.userAvatar.src = profile.titlePhoto && profile.titlePhoto.startsWith('http')
    ? profile.titlePhoto
    : 'logo/icon32.png';
  elements.userHandle.textContent = profile.handle;
  elements.userRankBadge.textContent = profile.rank;
  elements.userRating.textContent = profile.rating;
  elements.userMaxRating.textContent = profile.maxRating;

  const color = CF_RANK_COLORS[profile.rank.toLowerCase()] || '#9ca3af';
  elements.userRankBadge.style.backgroundColor = `${color}22`;
  elements.userRankBadge.style.color = color;
  elements.userRankBadge.style.border = `1px solid ${color}44`;
  elements.userRating.style.color = color;
}

function renderProfilePrompt(show = true) {
  elements.profileHud.classList.add('hidden');
  elements.handleForm.classList.add('hidden');
  elements.profilePrompt.classList.toggle('hidden', !show);
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Search
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    elements.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
    state.selectedCardIndex = -1;
    renderContests();
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.clearSearchBtn.style.display = 'none';
    elements.searchInput.focus();
    renderContests();
  });

  // Duration Filter Pills
  elements.durPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      elements.durPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeDurFilter = pill.dataset.dur;
      renderContests();
    });
  });

  // Segmented Tabs
  elements.tabItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      elements.tabItems.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeTab = btn.dataset.tab;
      state.selectedCardIndex = -1;
      renderContests();
    });
  });

  // Refresh
  elements.refreshBtn.addEventListener('click', async () => {
    elements.refreshIcon.classList.add('spin');
    await fetchContests(true);
    if (state.settings.cfHandle) refreshCfProfile(state.settings.cfHandle);
    setTimeout(() => elements.refreshIcon.classList.remove('spin'), 750);
  });

  // Profile Handle Input Actions
  elements.addHandleBtn.addEventListener('click', () => {
    elements.profilePrompt.classList.add('hidden');
    elements.handleForm.classList.remove('hidden');
    elements.handleInput.value = state.settings.cfHandle || '';
    elements.handleInput.focus();
  });

  elements.cancelHandleBtn.addEventListener('click', () => {
    elements.handleForm.classList.add('hidden');
    if (state.cfProfile) elements.profileHud.classList.remove('hidden');
    else elements.profilePrompt.classList.remove('hidden');
  });

  elements.editHandleBtn.addEventListener('click', () => {
    elements.profileHud.classList.add('hidden');
    elements.handleForm.classList.remove('hidden');
    elements.handleInput.value = state.settings.cfHandle || '';
    elements.handleInput.focus();
  });

  elements.saveHandleBtn.addEventListener('click', async () => {
    const handle = elements.handleInput.value.trim();
    state.settings.cfHandle = handle;
    await chrome.storage.local.set({ settings: state.settings });
    if (handle) {
      await refreshCfProfile(handle);
    } else {
      state.cfProfile = null;
      await chrome.storage.local.remove('cfProfile');
      renderProfilePrompt(true);
    }
  });

  elements.handleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') elements.saveHandleBtn.click();
    else if (e.key === 'Escape') elements.cancelHandleBtn.click();
  });

  // Settings Dialog
  elements.settingsBtn.addEventListener('click', () => {
    elements.reminderOffsetSelect.value = state.settings.reminderMinutes || 15;
    elements.timeFormatSelect.value = state.settings.timeFormat || '12';
    elements.hideLongContestsSwitch.checked = state.settings.hideLongContests !== false;
    elements.clistUsernameInput.value = state.settings.customClistUsername || '';
    elements.clistApiKeyInput.value = state.settings.customClistApiKey || '';
    applyThemeAccent(state.settings.themeAccent || 'cyan');
    elements.settingsModal.classList.remove('hidden');
  });

  elements.closeSettingsBtn.addEventListener('click', () => {
    elements.settingsModal.classList.add('hidden');
  });

  // Accent Dot Click
  elements.accentDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const accent = dot.dataset.accent;
      state.settings.themeAccent = accent;
      applyThemeAccent(accent);
    });
  });

  elements.saveSettingsBtn.addEventListener('click', async () => {
    state.settings.reminderMinutes = parseInt(elements.reminderOffsetSelect.value, 10);
    state.settings.timeFormat = elements.timeFormatSelect.value;
    state.settings.hideLongContests = elements.hideLongContestsSwitch.checked;
    state.settings.customClistUsername = elements.clistUsernameInput.value.trim();
    state.settings.customClistApiKey = elements.clistApiKeyInput.value.trim();

    await chrome.storage.local.set({ settings: state.settings });
    elements.settingsModal.classList.add('hidden');
    renderContests();
    fetchContests(true);
  });

  elements.settingsModal.addEventListener('click', (e) => {
    if (e.target === elements.settingsModal) elements.settingsModal.classList.add('hidden');
  });

  // Calendar Popover Options
  elements.calGoogleBtn.addEventListener('click', () => {
    if (state.activeCalendarContest) {
      const url = createGoogleCalendarUrl(state.activeCalendarContest);
      window.open(url, '_blank');
      hideCalendarPopover();
    }
  });

  elements.calOutlookBtn.addEventListener('click', () => {
    if (state.activeCalendarContest) {
      const url = createOutlookCalendarUrl(state.activeCalendarContest);
      window.open(url, '_blank');
      hideCalendarPopover();
    }
  });

  elements.calIcsBtn.addEventListener('click', () => {
    if (state.activeCalendarContest) {
      downloadIcsFile(state.activeCalendarContest);
      hideCalendarPopover();
    }
  });

  document.addEventListener('click', (e) => {
    if (!elements.calendarPopover.classList.contains('hidden')) {
      if (!elements.calendarPopover.contains(e.target) && !e.target.closest('.cal-trigger-btn')) {
        hideCalendarPopover();
      }
    }
  });
}

function showCalendarPopover(contest, btnElement) {
  state.activeCalendarContest = contest;
  const rect = btnElement.getBoundingClientRect();
  elements.calendarPopover.style.top = `${rect.top - 120}px`;
  elements.calendarPopover.style.left = `${Math.max(16, rect.left - 40)}px`;
  elements.calendarPopover.classList.remove('hidden');
}

function hideCalendarPopover() {
  elements.calendarPopover.classList.add('hidden');
  state.activeCalendarContest = null;
}

/**
 * Keyboard Power-User Navigation (Raycast Style)
 */
function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // If typing in search or input form, don't hijack unless it's Esc or Enter
    const inInput = e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT';

    // Global: Ctrl+K or / focuses search
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      elements.searchInput.focus();
      elements.searchInput.select();
      return;
    }

    if (!inInput && e.key === '/') {
      e.preventDefault();
      elements.searchInput.focus();
      return;
    }

    // Esc closes popovers / modals or clears search
    if (e.key === 'Escape') {
      if (!elements.settingsModal.classList.contains('hidden')) {
        elements.settingsModal.classList.add('hidden');
        return;
      }
      if (!elements.calendarPopover.classList.contains('hidden')) {
        hideCalendarPopover();
        return;
      }
      if (elements.searchInput.value) {
        elements.clearSearchBtn.click();
        return;
      }
    }

    if (inInput) return; // Don't trigger letter shortcuts when typing

    // Number keys 1-5 switch tabs
    if (['1', '2', '3', '4', '5'].includes(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      if (elements.tabItems[idx]) {
        elements.tabItems[idx].click();
      }
      return;
    }

    // 'R' refreshes
    if (e.key.toLowerCase() === 'r') {
      elements.refreshBtn.click();
      return;
    }

    // Arrow navigation for contest cards
    const cards = document.querySelectorAll('.contest-card');
    if (cards.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      state.selectedCardIndex = Math.min(state.selectedCardIndex + 1, cards.length - 1);
      highlightSelectedCard(cards);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      state.selectedCardIndex = Math.max(state.selectedCardIndex - 1, 0);
      highlightSelectedCard(cards);
    } else if (e.key === 'Enter') {
      if (state.selectedCardIndex >= 0 && cards[state.selectedCardIndex]) {
        const titleLink = cards[state.selectedCardIndex].querySelector('.contest-headline');
        if (titleLink) window.open(titleLink.href, '_blank');
      }
    } else if (e.key.toLowerCase() === 's') {
      if (state.selectedCardIndex >= 0 && cards[state.selectedCardIndex]) {
        const starBtn = cards[state.selectedCardIndex].querySelector('.star-btn');
        if (starBtn) starBtn.click();
      }
    } else if (e.key.toLowerCase() === 'c') {
      if (state.selectedCardIndex >= 0 && cards[state.selectedCardIndex]) {
        const calBtn = cards[state.selectedCardIndex].querySelector('.cal-trigger-btn');
        if (calBtn) calBtn.click();
      }
    }
  });
}

function highlightSelectedCard(cards) {
  cards.forEach((c, idx) => {
    if (idx === state.selectedCardIndex) {
      c.classList.add('card-selected');
      c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      c.classList.remove('card-selected');
    }
  });
}

/**
 * Render Platform Filter Chips
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
 * Direct official Codeforces API fallback
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
 * Filter Contests
 */
function getFilteredContests() {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return state.contests.filter((contest) => {
    // Platform
    if (state.selectedPlatforms.length > 0 && !state.selectedPlatforms.includes(contest.resource)) {
      return false;
    }

    // Duration Setting (> 24 hours)
    if (state.settings.hideLongContests && contest.duration > 86400) {
      return false;
    }

    // Duration Quick Pill Filter
    if (state.activeDurFilter === 'short' && contest.duration > 7200) return false;
    if (state.activeDurFilter === 'medium' && (contest.duration <= 7200 || contest.duration > 10800)) return false;
    if (state.activeDurFilter === 'long' && contest.duration <= 10800) return false;

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
 * Tab Counts
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

  const html = filtered.map((c, idx) => createContestCardHtml(c, idx)).join('');
  elements.contestList.innerHTML = html;

  attachCardActionListeners();
}

/**
 * Empty State View
 */
function renderEmptyState() {
  let title = 'No contests found';
  let desc = 'Try selecting more platforms or resetting your duration filter.';

  if (state.activeTab === 'live') {
    title = 'No live contests right now';
    desc = 'Check the Today or Upcoming tabs to see what rounds start next.';
  } else if (state.activeTab === 'saved') {
    title = 'No starred contests';
    desc = 'Star any contest using the bookmark button or press [S] to pin it here.';
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
function createContestCardHtml(contest, index) {
  const conf = PLATFORMS_CONFIG[contest.resource] || { name: contest.resource, icon: 'logo/icon16.png' };
  const now = new Date();
  const start = new Date(contest.start.endsWith('Z') ? contest.start : contest.start + '.000Z');
  const end = new Date(contest.end.endsWith('Z') ? contest.end : contest.end + '.000Z');

  const isLive = start <= now && end >= now;
  const isBookmarked = state.bookmarkedIds.includes(contest.id);
  const hasReminder = Boolean(state.reminders && state.reminders[contest.id]);
  const isSelected = index === state.selectedCardIndex;

  // Status badge
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

  // Time & Date format
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

  const use24h = state.settings.timeFormat === '24';
  const timeString = start.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24h
  });
  const durationString = formatDuration(contest.duration);

  return `
    <article class="contest-card ${isLive ? 'card-live' : ''} ${isSelected ? 'card-selected' : ''}" data-id="${contest.id}" data-index="${index}">
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
          <!-- Calendar Dropdown Trigger -->
          <button class="btn-utility cal-trigger-btn" data-id="${contest.id}" title="Sync with Google, Outlook or iCal [C]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
            <span>+ Calendar</span>
          </button>

          <!-- Alert Reminder -->
          <button class="btn-utility reminder-btn ${hasReminder ? 'active-bell' : ''}" data-id="${contest.id}" title="${hasReminder ? 'Cancel Alert' : 'Set 15m Desktop Alert'}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="${hasReminder ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>${hasReminder ? 'Alert Set' : 'Remind'}</span>
          </button>

          <!-- Star Bookmark -->
          <button class="btn-utility star-btn ${isBookmarked ? 'active-star' : ''}" data-id="${contest.id}" title="${isBookmarked ? 'Remove Star [S]' : 'Star Contest [S]'}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
        </div>

        <a href="${escapeHtml(contest.href)}" target="_blank" rel="noopener" class="link-participate" title="Open contest page [Enter]">
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
  // Calendar Trigger
  document.querySelectorAll('.cal-trigger-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const contest = state.contests.find((c) => String(c.id) === String(id));
      if (contest) showCalendarPopover(contest, btn);
    });
  });

  // Star
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

  // Reminder
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
 * Format Duration
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
 * Calendar Link Constructors
 */
function getUtcDates(contest) {
  const start = new Date(contest.start.endsWith('Z') ? contest.start : contest.start + '.000Z');
  const end = new Date(contest.end.endsWith('Z') ? contest.end : contest.end + '.000Z');
  const pad = (n) => String(n).padStart(2, '0');
  const toUtc = (d) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  return { start, end, startUtc: toUtc(start), endUtc: toUtc(end) };
}

function createGoogleCalendarUrl(contest) {
  const { startUtc, endUtc } = getUtcDates(contest);
  const title = encodeURIComponent(`[${contest.resource}] ${contest.event}`);
  const details = encodeURIComponent(
    `Contest: ${contest.event}\nPlatform: ${contest.resource}\nLink: ${contest.href}\n\nTracked via CodeRadar`
  );
  const location = encodeURIComponent(contest.href);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;
}

function createOutlookCalendarUrl(contest) {
  const { start, end } = getUtcDates(contest);
  const title = encodeURIComponent(`[${contest.resource}] ${contest.event}`);
  const details = encodeURIComponent(`Contest: ${contest.event}\nPlatform: ${contest.resource}\nLink: ${contest.href}`);
  const location = encodeURIComponent(contest.href);
  const startIso = encodeURIComponent(start.toISOString());
  const endIso = encodeURIComponent(end.toISOString());

  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&location=${location}&startdt=${startIso}&enddt=${endIso}&path=/calendar/action/compose&rru=addevent`;
}

function downloadIcsFile(contest) {
  const { startUtc, endUtc } = getUtcDates(contest);
  const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const cleanTitle = contest.event.replace(/[,;\n]/g, ' ');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CodeRadar//Contest Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:coderadar-${contest.id}@coderadar.local`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:[${contest.resource}] ${cleanTitle}`,
    `DESCRIPTION:${contest.href}`,
    `LOCATION:${contest.href}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${cleanTitle.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
