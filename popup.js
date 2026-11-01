/**
 * CodeRadar - Multi-Platform Competitive Programming Engine
 * Unified tracking for Codeforces, CodeChef, and LeetCode.
 * Includes friends standings, keyboard navigation, and universal calendar sync.
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

// Rank Colors
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
  'legendary grandmaster': '#ef4444',
  'unrated': '#9ca3af'
};

const CC_STAR_COLORS = {
  '1★': '#9ca3af',
  '2★': '#10b981',
  '3★': '#3b82f6',
  '4★': '#8b5cf6',
  '5★': '#f59e0b',
  '6★': '#f97316',
  '7★': '#ef4444',
  'unrated': '#9ca3af'
};

const LC_BADGE_COLORS = {
  'guardian': '#ef4444',
  'knight': '#f59e0b',
  'contestant': '#38bdf8',
  'unrated': '#9ca3af'
};

// Application State
const state = {
  contests: [],
  activeTab: 'all',
  activeDurFilter: 'all',
  searchQuery: '',
  selectedPlatforms: Object.keys(PLATFORMS_CONFIG),
  bookmarkedIds: [],
  reminders: {},
  selectedCardIndex: -1,
  activeCalendarContest: null,
  trackedUsers: [], // [{ platform, handle, rating, maxRating, rank, realName, titlePhoto, totalSolved, globalRanking }]
  activeUserKey: '',
  selectedPlatformChoice: 'codeforces',
  settings: {
    reminderMinutes: 15,
    hideLongContests: true,
    timeFormat: '12',
    themeAccent: 'cyan',
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
  durationSelect: document.getElementById('durationSelect'),
  tabItems: document.querySelectorAll('.tab-item'),
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
  topbarUserPill: document.getElementById('topbarUserPill'),
  topbarUserText: document.getElementById('topbarUserText'),
  profileDrawer: document.getElementById('profileDrawer'),
  closeDrawerBtn: document.getElementById('closeDrawerBtn'),
  userSwitcherStrip: document.getElementById('userSwitcherStrip'),
  userTabsContainer: document.getElementById('userTabsContainer'),
  addUserBtn: document.getElementById('addUserBtn'),
  standingsBtn: document.getElementById('standingsBtn'),
  profileHud: document.getElementById('profileHud'),
  handleForm: document.getElementById('handleForm'),
  handleInput: document.getElementById('handleInput'),
  saveHandleBtn: document.getElementById('saveHandleBtn'),
  cancelHandleBtn: document.getElementById('cancelHandleBtn'),
  removeUserBtn: document.getElementById('removeUserBtn'),
  platformChoiceBtns: document.querySelectorAll('.platform-choice-btn'),
  userAvatarWrap: document.getElementById('userAvatarWrap'),
  userPlatformBadge: document.getElementById('userPlatformBadge'),
  userHandle: document.getElementById('userHandle'),
  userRankBadge: document.getElementById('userRankBadge'),
  userRating: document.getElementById('userRating'),
  userMaxRatingWrap: document.getElementById('userMaxRatingWrap'),
  userMaxRating: document.getElementById('userMaxRating'),
  userExtraStatsWrap: document.getElementById('userExtraStatsWrap'),
  userExtraStats: document.getElementById('userExtraStats'),
  userRealNameWrap: document.getElementById('userRealNameWrap'),
  userRealName: document.getElementById('userRealName'),
  userProfileLink: document.getElementById('userProfileLink'),

  // Standings Dialog
  standingsModal: document.getElementById('standingsModal'),
  closeStandingsBtn: document.getElementById('closeStandingsBtn'),
  standingsList: document.getElementById('standingsList'),

  // Calendar popover
  calendarPopover: document.getElementById('calendarPopover'),
  calGoogleBtn: document.getElementById('calGoogleBtn'),
  calOutlookBtn: document.getElementById('calOutlookBtn'),
  calIcsBtn: document.getElementById('calIcsBtn'),

  // Theme dots
  accentDots: document.querySelectorAll('.accent-dot'),

  // Live Arena Hero Bar
  liveArenaBar: document.getElementById('liveArenaBar'),
  liveArenaTimer: document.getElementById('liveArenaTimer'),
  liveArenaIcon: document.getElementById('liveArenaIcon'),
  liveArenaPlatform: document.getElementById('liveArenaPlatform'),
  liveArenaName: document.getElementById('liveArenaName'),
  liveArenaBtn: document.getElementById('liveArenaBtn'),

  // Share Coder Card Modal
  shareCardBtn: document.getElementById('shareCardBtn'),
  shareCardModal: document.getElementById('shareCardModal'),
  closeShareCardBtn: document.getElementById('closeShareCardBtn'),
  cardVisualPreview: document.getElementById('cardVisualPreview'),
  btnDownloadCardPng: document.getElementById('btnDownloadCardPng'),
  btnCopyBadgeMd: document.getElementById('btnCopyBadgeMd'),
  btnCopyStatsText: document.getElementById('btnCopyStatsText'),
  cardActionNotice: document.getElementById('cardActionNotice'),

  // Badge Mode
  badgeModeSelect: document.getElementById('badgeModeSelect')
};

// Bootstrap App
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  setupKeyboardShortcuts();
  detectTimezone();
  await loadStoredData();
  applyThemeAccent(state.settings.themeAccent || 'cyan');
  renderPlatformChips();
  renderContests();

  if (state.trackedUsers.length > 0) {
    refreshAllTrackedUsers();
  }

  const shouldFetch = state.contests.length === 0;
  await fetchContests(shouldFetch);
});

function detectTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    const offsetMin = -new Date().getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const hours = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, '0');
    const mins = String(Math.abs(offsetMin) % 60).padStart(2, '0');
    const shortTz = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || 'UTC';

    if (elements.tzDisplay) {
      elements.tzDisplay.textContent = `${shortTz} (UTC${sign}${hours}:${mins})`;
      elements.tzDisplay.title = `Times synchronized to: ${tz} (UTC${sign}${hours}:${mins})`;
    }
  } catch (e) {
    if (elements.tzDisplay) elements.tzDisplay.textContent = 'LOCAL';
  }
}

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
    const data = await chrome.storage.local.get([
      'contests',
      'settings',
      'bookmarkedIds',
      'trackedUsers',
      'activeUserKey'
    ]);

    if (data.settings) {
      state.settings = { ...state.settings, ...data.settings };
      if (Array.isArray(data.settings.selectedPlatforms) && data.settings.selectedPlatforms.length > 0) {
        state.selectedPlatforms = data.settings.selectedPlatforms;
      }
      if (data.settings.reminders) {
        state.reminders = data.settings.reminders;
      }
      if (elements.badgeModeSelect) {
        elements.badgeModeSelect.value = state.settings.badgeMode || 'contests';
      }
    }

    if (data.bookmarkedIds) {
      state.bookmarkedIds = data.bookmarkedIds;
    }

    if (Array.isArray(data.trackedUsers) && data.trackedUsers.length > 0) {
      state.trackedUsers = data.trackedUsers;
      state.activeUserKey = data.activeUserKey || getUserKey(data.trackedUsers[0]);
    }

    renderMultiUserSection();

    if (Array.isArray(data.contests) && data.contests.length > 0) {
      state.contests = data.contests;
      elements.syncStatus.textContent = 'Synced from local cache';
    }
  } catch (err) {
    console.warn('[CodeRadar] Storage load error:', err);
  }
}

function getUserKey(user) {
  return `${user.platform || 'codeforces'}:${user.handle.toLowerCase()}`;
}

function getRankColor(user) {
  const rank = (user.rank || 'unrated').toLowerCase();
  if (user.platform === 'codechef') {
    return CC_STAR_COLORS[rank] || '#9ca3af';
  }
  if (user.platform === 'leetcode') {
    return LC_BADGE_COLORS[rank] || '#9ca3af';
  }
  return CF_RANK_COLORS[rank] || '#9ca3af';
}

/**
 * Multi-Platform User Refresh (Codeforces, CodeChef, LeetCode)
 */
async function refreshAllTrackedUsers() {
  if (state.trackedUsers.length === 0) return;

  const cfUsers = state.trackedUsers.filter((u) => (u.platform || 'codeforces') === 'codeforces');
  const ccUsers = state.trackedUsers.filter((u) => u.platform === 'codechef');
  const lcUsers = state.trackedUsers.filter((u) => u.platform === 'leetcode');

  // 1. Batch refresh Codeforces
  if (cfUsers.length > 0) {
    try {
      const handles = cfUsers.map((u) => u.handle);
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handles.join(';'))}`);
      const data = await res.json();
      if (data.status === 'OK' && Array.isArray(data.result)) {
        data.result.forEach((info) => {
          const match = state.trackedUsers.find(
            (u) => (u.platform || 'codeforces') === 'codeforces' && u.handle.toLowerCase() === info.handle.toLowerCase()
          );
          if (match) {
            match.rating = info.rating || 0;
            match.maxRating = info.maxRating || 0;
            match.rank = info.rank || 'unrated';
            match.titlePhoto = info.titlePhoto;
          }
        });
      }
    } catch (err) {
      console.warn('[CodeRadar] Codeforces refresh error:', err);
    }
  }

  // 2. Refresh CodeChef users
  for (const ccUser of ccUsers) {
    try {
      const info = await fetchCodeChefProfile(ccUser.handle);
      if (info) {
        ccUser.rating = info.rating;
        ccUser.maxRating = info.maxRating;
        ccUser.rank = info.rank;
        ccUser.realName = info.realName;
      }
    } catch (err) {
      console.warn(`[CodeRadar] CodeChef refresh error for ${ccUser.handle}:`, err);
    }
  }

  // 3. Refresh LeetCode users
  for (const lcUser of lcUsers) {
    try {
      const info = await fetchLeetCodeProfile(lcUser.handle);
      if (info) {
        lcUser.rating = info.rating;
        lcUser.maxRating = info.rating;
        lcUser.rank = info.rank;
        lcUser.totalSolved = info.totalSolved;
        lcUser.globalRanking = info.globalRanking;
        lcUser.realName = info.realName;
        lcUser.titlePhoto = info.titlePhoto;
      }
    } catch (err) {
      console.warn(`[CodeRadar] LeetCode refresh error for ${lcUser.handle}:`, err);
    }
  }

  await chrome.storage.local.set({ trackedUsers: state.trackedUsers, activeUserKey: state.activeUserKey });
  renderMultiUserSection();
}

/**
 * Fetch CodeChef Profile
 */
async function fetchCodeChefProfile(handle) {
  try {
    const url = `https://www.codechef.com/users/${encodeURIComponent(handle)}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const html = await res.text();
    const ratingMatch = html.match(/class=['"]rating['"]>([0-9]+)/i);
    const highestMatch = html.match(/Highest Rating[\s\S]*?([0-9]{3,4})/i);
    const starsMatch = html.match(/class=['"]rating-star['"]>([\s\S]*?)<\/div>/i);
    const starCount = starsMatch ? (starsMatch[1].match(/&#9733;/g) || []).length : 0;
    const nameMatch = html.match(/class=['"]h2-style['"]>([^<]+)/i);

    const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;
    const maxRating = highestMatch ? parseInt(highestMatch[1], 10) : rating;
    const rank = starCount > 0 ? `${starCount}★` : 'unrated';
    const realName = nameMatch ? nameMatch[1].trim() : '';

    return { rating, maxRating, rank, realName };
  } catch (e) {
    console.warn(`[CodeRadar] CodeChef error for ${handle}:`, e);
    return null;
  }
}

/**
 * Fetch LeetCode Profile via GraphQL
 */
async function fetchLeetCodeProfile(username) {
  try {
    const query = JSON.stringify({
      query: `query getUser($username: String!) {
        userContestRanking(username: $username) {
          rating
          globalRanking
          totalParticipants
          topPercentage
          badge { name }
        }
        matchedUser(username: $username) {
          username
          profile { realName userAvatar }
          submitStatsGlobal { acSubmissionNum { difficulty count } }
        }
      }`,
      variables: { username }
    });

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: query
    });

    const json = await res.json();
    const data = json.data;
    if (!data || !data.matchedUser) return null;

    const ranking = data.userContestRanking;
    const matched = data.matchedUser;

    const rating = ranking && ranking.rating ? Math.round(ranking.rating) : 0;
    let badge = ranking && ranking.badge && ranking.badge.name ? ranking.badge.name : '';
    if (!badge) {
      if (rating >= 2150) badge = 'Guardian';
      else if (rating >= 1850) badge = 'Knight';
      else if (rating > 0) badge = 'Contestant';
      else badge = 'Unrated';
    }

    const totalSolved =
      matched.submitStatsGlobal && Array.isArray(matched.submitStatsGlobal.acSubmissionNum)
        ? matched.submitStatsGlobal.acSubmissionNum.find((d) => d.difficulty === 'All')?.count || 0
        : 0;

    return {
      handle: matched.username,
      rating: rating,
      maxRating: rating,
      rank: badge,
      globalRanking: ranking ? ranking.globalRanking : null,
      totalSolved: totalSolved,
      realName: matched.profile ? matched.profile.realName : '',
      titlePhoto: matched.profile ? matched.profile.userAvatar : ''
    };
  } catch (e) {
    console.warn(`[CodeRadar] LeetCode error for ${username}:`, e);
    return null;
  }
}

/**
 * Render Multi-User Switcher & Card
 */
function renderMultiUserSection() {
  if (state.trackedUsers.length === 0) {
    if (elements.topbarUserText) elements.topbarUserText.textContent = '+ Add Profile';
    if (elements.topbarUserPill) elements.topbarUserPill.classList.remove('has-user');
    if (elements.userSwitcherStrip) elements.userSwitcherStrip.classList.add('hidden');
    if (elements.profileHud) elements.profileHud.classList.add('hidden');
    if (elements.handleForm) elements.handleForm.classList.remove('hidden');
    return;
  }

  if (elements.userSwitcherStrip) elements.userSwitcherStrip.classList.remove('hidden');
  if (elements.profileHud) elements.profileHud.classList.remove('hidden');
  if (elements.handleForm) elements.handleForm.classList.add('hidden');

  let activeUser = state.trackedUsers.find((u) => getUserKey(u) === state.activeUserKey);
  if (!activeUser) {
    activeUser = state.trackedUsers[0];
    state.activeUserKey = getUserKey(activeUser);
  }

  const platform = activeUser.platform || 'codeforces';
  const isCC = platform === 'codechef';
  const isLC = platform === 'leetcode';
  const tag = isCC ? 'CC' : isLC ? 'LC' : 'CF';

  if (elements.topbarUserText) {
    elements.topbarUserText.textContent = `@${activeUser.handle} (${tag} ${activeUser.rating || 0})`;
  }
  if (elements.topbarUserPill) {
    elements.topbarUserPill.classList.add('has-user');
  }

  // 1. Render User Switcher Chips
  elements.userTabsContainer.innerHTML = '';
  state.trackedUsers.forEach((u) => {
    const uKey = getUserKey(u);
    const isActive = uKey === state.activeUserKey;
    const uPlat = u.platform || 'codeforces';
    const tag = uPlat === 'codechef' ? 'CC' : uPlat === 'leetcode' ? 'LC' : 'CF';
    const tagClass = uPlat === 'codechef' ? 'cc' : uPlat === 'leetcode' ? 'lc' : 'cf';
    const rankColor = getRankColor(u);

    const chip = document.createElement('button');
    chip.className = `user-tab-chip ${isActive ? 'active' : ''}`;
    chip.dataset.key = uKey;
    chip.innerHTML = `
      <span class="chip-platform-tag ${tagClass}">${tag}</span>
      <span class="user-tab-dot" style="background: ${rankColor};"></span>
      <span>${escapeHtml(u.handle)}</span>
    `;

    chip.addEventListener('click', () => {
      state.activeUserKey = uKey;
      chrome.storage.local.set({ activeUserKey: state.activeUserKey });
      renderMultiUserSection();
    });

    elements.userTabsContainer.appendChild(chip);
  });

  // 2. Render Active User Card
  elements.userHandle.textContent = activeUser.handle;
  elements.userPlatformBadge.textContent = isCC ? 'CodeChef' : isLC ? 'LeetCode' : 'Codeforces';
  elements.userPlatformBadge.className = `user-platform-pill ${isCC ? 'cc' : isLC ? 'lc' : 'cf'}`;
  elements.userRankBadge.textContent = activeUser.rank || 'unrated';
  elements.userRating.textContent = activeUser.rating || 0;

  // Max rating vs Solved count
  if (isLC) {
    elements.userMaxRatingWrap.style.display = 'none';
    if (activeUser.totalSolved !== undefined) {
      elements.userExtraStatsWrap.style.display = 'inline-flex';
      elements.userExtraStats.textContent = `Solved: ${activeUser.totalSolved}`;
    } else {
      elements.userExtraStatsWrap.style.display = 'none';
    }
  } else {
    elements.userMaxRatingWrap.style.display = 'inline-flex';
    elements.userMaxRating.textContent = activeUser.maxRating || 0;
    elements.userExtraStatsWrap.style.display = 'none';
  }

  // Real Name
  if (activeUser.realName) {
    elements.userRealNameWrap.style.display = 'inline-flex';
    elements.userRealName.textContent = activeUser.realName;
  } else {
    elements.userRealNameWrap.style.display = 'none';
  }

  // Profile link
  elements.userProfileLink.href = isCC
    ? `https://www.codechef.com/users/${encodeURIComponent(activeUser.handle)}`
    : isLC
    ? `https://leetcode.com/u/${encodeURIComponent(activeUser.handle)}`
    : `https://codeforces.com/profile/${encodeURIComponent(activeUser.handle)}`;

  const color = getRankColor(activeUser);
  elements.userRankBadge.style.backgroundColor = `${color}22`;
  elements.userRankBadge.style.color = color;
  elements.userRankBadge.style.border = `1px solid ${color}44`;
  elements.userRating.style.color = color;

  renderBulletproofAvatar(activeUser, color);
}

/**
 * Bulletproof Monogram Avatar
 */
function renderBulletproofAvatar(user, rankColor) {
  const container = elements.userAvatarWrap;
  container.innerHTML = '';

  const initial = (user.handle || '?').substring(0, 2).toUpperCase();

  const isDefaultImage =
    user.platform === 'codechef' ||
    !user.titlePhoto ||
    user.titlePhoto.includes('no-title.jpg') ||
    user.titlePhoto.includes('no-avatar.jpg') ||
    !user.titlePhoto.startsWith('http');

  if (isDefaultImage) {
    container.innerHTML = `
      <div class="monogram-avatar" style="border-color: ${rankColor}; color: ${rankColor};">
        ${initial}
      </div>
    `;
  } else {
    const img = document.createElement('img');
    img.src = user.titlePhoto;
    img.alt = user.handle;
    img.className = 'user-avatar-img';

    const mono = document.createElement('div');
    mono.className = 'monogram-avatar hidden';
    mono.style.borderColor = rankColor;
    mono.style.color = rankColor;
    mono.textContent = initial;

    img.onerror = () => {
      img.style.display = 'none';
      mono.classList.remove('hidden');
    };

    container.appendChild(img);
    container.appendChild(mono);
  }
}

/**
 * Standings Modal (Ranks all tracked users across CF, CC, LC)
 */
function renderStandingsModal() {
  const sorted = [...state.trackedUsers].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  elements.standingsList.innerHTML = '';

  if (sorted.length === 0) {
    elements.standingsList.innerHTML = '<p class="empty-view-desc">No tracked users yet.</p>';
    return;
  }

  sorted.forEach((u, idx) => {
    const uPlat = u.platform || 'codeforces';
    const tag = uPlat === 'codechef' ? 'CC' : uPlat === 'leetcode' ? 'LC' : 'CF';
    const tagClass = uPlat === 'codechef' ? 'cc' : uPlat === 'leetcode' ? 'lc' : 'cf';
    const color = getRankColor(u);
    const initial = (u.handle || '?').substring(0, 2).toUpperCase();

    const row = document.createElement('div');
    row.className = 'standings-row';
    row.innerHTML = `
      <span class="standings-rank">#${idx + 1}</span>
      <div class="standings-avatar-wrap">
        <div class="standings-mono" style="border-color: ${color}; color: ${color};">
          ${initial}
        </div>
      </div>
      <div class="standings-info">
        <span class="standings-handle">
          <span>${escapeHtml(u.handle)}</span>
          <span class="chip-platform-tag ${tagClass}">${tag}</span>
        </span>
        <span class="standings-tier" style="color: ${color};">${escapeHtml(u.rank || 'unrated')}</span>
      </div>
      <div class="standings-rating-box">
        <span class="standings-rating" style="color: ${color};">${u.rating || 0}</span>
        <span class="standings-max">${u.platform === 'leetcode' ? (u.totalSolved ? `${u.totalSolved} solved` : '') : `Max ${u.maxRating || 0}`}</span>
      </div>
    `;

    elements.standingsList.appendChild(row);
  });
}

/**
 * Coder Identity Card Generation & Sharing
 */
function getCoderStatsSummary() {
  const active = state.trackedUsers.find((u) => getUserKey(u) === state.activeUserKey) || state.trackedUsers[0];
  if (!active) return null;

  const cfUser = state.trackedUsers.find((u) => (u.platform || 'codeforces') === 'codeforces');
  const ccUser = state.trackedUsers.find((u) => u.platform === 'codechef');
  const lcUser = state.trackedUsers.find((u) => u.platform === 'leetcode');

  return { active, cfUser, ccUser, lcUser };
}

function openShareCardModal() {
  const data = getCoderStatsSummary();
  if (!data) {
    alert('Please add at least one username first to generate your Coder Identity Card!');
    return;
  }

  const { active, cfUser, ccUser, lcUser } = data;
  const rankColor = getRankColor(active);
  const initials = (active.handle || '?').substring(0, 2).toUpperCase();

  const previewEl = elements.cardVisualPreview;
  previewEl.innerHTML = `
    <div class="card-inner-header">
      <div class="card-watermark">
        <img src="logo/icon16.png" alt="" />
        <span>CodeRadar Identity</span>
      </div>
      <div class="card-tier-badge" style="color: ${rankColor}; border-color: ${rankColor}55; background: ${rankColor}15;">
        ${escapeHtml(active.rank || 'Unrated')}
      </div>
    </div>
    <div class="card-user-strip">
      <div class="card-monogram" style="color: ${rankColor}; border-color: ${rankColor};">
        ${initials}
      </div>
      <div class="card-user-info">
        <span class="card-handle">@${escapeHtml(active.handle)}</span>
        <span class="card-realname">${escapeHtml(active.realName || 'Competitive Programmer')}</span>
      </div>
    </div>
    <div class="card-stats-grid">
      <div class="card-stat-box">
        <div class="card-stat-header">
          <span>CODEFORCES</span>
          <span style="color: #60a5fa;">CF</span>
        </div>
        <span class="card-stat-val" style="color: #60a5fa;">${cfUser ? (cfUser.rating || 0) : '—'}</span>
        <span class="card-stat-sub">${cfUser ? (cfUser.rank || 'Unrated') : 'Not linked'}</span>
      </div>
      <div class="card-stat-box">
        <div class="card-stat-header">
          <span>CODECHEF</span>
          <span style="color: #fbbf24;">CC</span>
        </div>
        <span class="card-stat-val" style="color: #fbbf24;">${ccUser ? (ccUser.rating || 0) : '—'}</span>
        <span class="card-stat-sub">${ccUser ? (ccUser.rank || '1★') : 'Not linked'}</span>
      </div>
      <div class="card-stat-box">
        <div class="card-stat-header">
          <span>LEETCODE</span>
          <span style="color: #fb923c;">LC</span>
        </div>
        <span class="card-stat-val" style="color: #fb923c;">${lcUser ? (lcUser.rating || 0) : '—'}</span>
        <span class="card-stat-sub">${lcUser ? (lcUser.totalSolved !== undefined ? `${lcUser.totalSolved} solved` : lcUser.rank) : 'Not linked'}</span>
      </div>
    </div>
  `;

  elements.cardActionNotice.classList.add('hidden');
  elements.shareCardModal.classList.remove('hidden');
}

function showCardNotice(msg) {
  elements.cardActionNotice.textContent = msg;
  elements.cardActionNotice.classList.remove('hidden');
  setTimeout(() => {
    elements.cardActionNotice.classList.add('hidden');
  }, 2200);
}

function copyCardBadgesMarkdown() {
  const data = getCoderStatsSummary();
  if (!data) return;
  const { cfUser, ccUser, lcUser } = data;

  let md = '### ⚡ Competitive Programming Stats\n';
  if (cfUser) {
    const r = cfUser.rating || 0;
    const rank = encodeURIComponent(cfUser.rank || 'newbie');
    md += `[![Codeforces](https://img.shields.io/badge/Codeforces-${rank}%20${r}-blue?style=for-the-badge&logo=codeforces)](https://codeforces.com/profile/${encodeURIComponent(cfUser.handle)})\n`;
  }
  if (lcUser) {
    const r = lcUser.rating || 0;
    const solved = lcUser.totalSolved ? `%20(${lcUser.totalSolved}%20Solved)` : '';
    md += `[![LeetCode](https://img.shields.io/badge/LeetCode-Rating%20${r}${solved}-orange?style=for-the-badge&logo=leetcode)](https://leetcode.com/u/${encodeURIComponent(lcUser.handle)})\n`;
  }
  if (ccUser) {
    const r = ccUser.rating || 0;
    const stars = encodeURIComponent(ccUser.rank || '1★');
    md += `[![CodeChef](https://img.shields.io/badge/CodeChef-${stars}%20${r}-yellow?style=for-the-badge&logo=codechef)](https://www.codechef.com/users/${encodeURIComponent(ccUser.handle)})\n`;
  }
  md += '\n*Powered by [CodeRadar](https://github.com/karanarjunjr/cp-calendar)*';

  navigator.clipboard.writeText(md).then(() => {
    showCardNotice('✓ GitHub Markdown copied to clipboard!');
  });
}

function copyCardStatsText() {
  const data = getCoderStatsSummary();
  if (!data) return;
  const { active, cfUser, ccUser, lcUser } = data;

  let txt = `⚡ CodeRadar Developer Identity: @${active.handle}\n`;
  if (active.realName) txt += `Name: ${active.realName}\n`;
  if (cfUser) txt += `• Codeforces: ${cfUser.rating || 0} (${cfUser.rank || 'Unrated'})\n`;
  if (ccUser) txt += `• CodeChef: ${ccUser.rating || 0} (${ccUser.rank || '1★'})\n`;
  if (lcUser) txt += `• LeetCode: ${lcUser.rating || 0} (${lcUser.rank || 'Contestant'}${lcUser.totalSolved ? `, ${lcUser.totalSolved} solved` : ''})\n`;
  txt += '— Verified with CodeRadar';

  navigator.clipboard.writeText(txt).then(() => {
    showCardNotice('✓ Stats summary copied to clipboard!');
  });
}

function exportCoderCardPng() {
  const data = getCoderStatsSummary();
  if (!data) return;
  const { active, cfUser, ccUser, lcUser } = data;

  const width = 1200;
  const height = 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(0.5, '#0e1422');
  bgGrad.addColorStop(1, '#080a10');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle Tech Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Accent Glow Ellipse
  const accentColor = getRankColor(active);
  const radGrad = ctx.createRadialGradient(width - 150, 150, 10, width - 150, 150, 300);
  radGrad.addColorStop(0, `${accentColor}33`);
  radGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = radGrad;
  ctx.beginPath();
  ctx.arc(width - 150, 150, 300, 0, Math.PI * 2);
  ctx.fill();

  // Outer Border Box
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Top Watermark & Verified Badge
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('⚡ CODERADAR • VERIFIED CODER ID', 80, 100);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }), width - 220, 100);

  // Avatar Circle
  const avatarX = 140;
  const avatarY = 230;
  const avatarR = 55;

  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
  ctx.fillStyle = '#161c28';
  ctx.fill();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Monogram text in avatar
  const initials = (active.handle || '?').substring(0, 2).toUpperCase();
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, avatarX, avatarY);

  // Reset text alignment
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Handle & Real Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`@${active.handle}`, 225, 220);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(active.realName || 'Competitive Programming Athlete', 225, 260);

  // Active Rank Badge
  ctx.fillStyle = `${accentColor}25`;
  ctx.fillRect(width - 320, 190, 240, 50);
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(width - 320, 190, 240, 50);

  ctx.fillStyle = accentColor;
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((active.rank || 'Unrated').toUpperCase(), width - 200, 222);
  ctx.textAlign = 'left';

  // Platform Cards Grid (3 cards at bottom)
  const cardY = 340;
  const cardW = 320;
  const cardH = 170;
  const gap = 30;
  const startX = 80;

  const platforms = [
    {
      title: 'CODEFORCES',
      code: 'CF',
      color: '#60a5fa',
      val: cfUser ? `${cfUser.rating || 0}` : '—',
      sub: cfUser ? `Max ${cfUser.maxRating || 0} • ${cfUser.rank || 'Unrated'}` : 'Not linked'
    },
    {
      title: 'CODECHEF',
      code: 'CC',
      color: '#fbbf24',
      val: ccUser ? `${ccUser.rating || 0}` : '—',
      sub: ccUser ? `Max ${ccUser.maxRating || 0} • ${ccUser.rank || '1★'}` : 'Not linked'
    },
    {
      title: 'LEETCODE',
      code: 'LC',
      color: '#fb923c',
      val: lcUser ? `${lcUser.rating || 0}` : '—',
      sub: lcUser ? `${lcUser.totalSolved ? `${lcUser.totalSolved} Solved • ` : ''}${lcUser.rank || 'Contestant'}` : 'Not linked'
    }
  ];

  platforms.forEach((p, idx) => {
    const px = startX + idx * (cardW + gap);

    // Box Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(px, cardY, cardW, cardH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, cardY, cardW, cardH);

    // Header
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(p.title, px + 20, cardY + 36);

    ctx.fillStyle = p.color;
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(p.code, px + cardW - 20, cardY + 36);
    ctx.textAlign = 'left';

    // Rating Value
    ctx.fillStyle = p.color;
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(p.val, px + 20, cardY + 95);

    // Subtitle
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(p.sub, px + 20, cardY + 135);
  });

  // Footer Tagline
  ctx.fillStyle = '#64748b';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Generated by CodeRadar • Chrome Web Store', 80, height - 55);

  // Trigger Download
  const link = document.createElement('a');
  link.download = `coderadar-${active.handle}-card.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showCardNotice('✓ High-res PNG card downloaded!');
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

  // Profile Drawer Toggle
  if (elements.topbarUserPill) {
    elements.topbarUserPill.addEventListener('click', () => {
      elements.profileDrawer.classList.toggle('hidden');
      elements.topbarUserPill.classList.toggle('active');
    });
  }

  if (elements.closeDrawerBtn) {
    elements.closeDrawerBtn.addEventListener('click', () => {
      elements.profileDrawer.classList.add('hidden');
      elements.topbarUserPill.classList.remove('active');
    });
  }

  // Duration Filter Dropdown
  if (elements.durationSelect) {
    elements.durationSelect.addEventListener('change', () => {
      state.activeDurFilter = elements.durationSelect.value;
      renderContests();
    });
  }

  // Tabs
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
    if (state.trackedUsers.length > 0) refreshAllTrackedUsers();
    setTimeout(() => elements.refreshIcon.classList.remove('spin'), 750);
  });

  // Add User Trigger
  const openAddUserForm = () => {
    elements.handleForm.classList.remove('hidden');
    elements.handleInput.value = '';
    elements.handleInput.focus();
  };

  elements.addUserBtn.addEventListener('click', openAddUserForm);
  elements.addFirstHandleBtn.addEventListener('click', openAddUserForm);

  elements.cancelHandleBtn.addEventListener('click', () => {
    elements.handleForm.classList.add('hidden');
  });

  // Platform choice buttons in add form
  elements.platformChoiceBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      elements.platformChoiceBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedPlatformChoice = btn.dataset.platform;

      if (state.selectedPlatformChoice === 'codechef') {
        elements.handleInput.placeholder = 'Enter CodeChef handle (e.g. geekykalpesh)';
      } else if (state.selectedPlatformChoice === 'leetcode') {
        elements.handleInput.placeholder = 'Enter LeetCode username (e.g. geekykalpesh, neal_wu)';
      } else {
        elements.handleInput.placeholder = 'Enter Codeforces handle (e.g. tourist)';
      }
      elements.handleInput.focus();
    });
  });

  // Save Handle Button
  elements.saveHandleBtn.addEventListener('click', async () => {
    const handle = elements.handleInput.value.trim();
    if (!handle) return;

    const platform = state.selectedPlatformChoice || 'codeforces';
    elements.saveHandleBtn.textContent = 'Verifying...';

    try {
      if (platform === 'codechef') {
        const info = await fetchCodeChefProfile(handle);
        if (info) {
          const newUser = {
            platform: 'codechef',
            handle: handle,
            rating: info.rating,
            maxRating: info.maxRating,
            rank: info.rank,
            realName: info.realName
          };

          const key = getUserKey(newUser);
          const existingIdx = state.trackedUsers.findIndex((u) => getUserKey(u) === key);
          if (existingIdx >= 0) state.trackedUsers[existingIdx] = newUser;
          else state.trackedUsers.push(newUser);

          state.activeUserKey = key;
          await chrome.storage.local.set({
            trackedUsers: state.trackedUsers,
            activeUserKey: state.activeUserKey
          });

          elements.handleForm.classList.add('hidden');
          renderMultiUserSection();
        } else {
          alert(`Could not verify CodeChef handle "${handle}". Check the spelling.`);
        }
      } else if (platform === 'leetcode') {
        const info = await fetchLeetCodeProfile(handle);
        if (info) {
          const newUser = {
            platform: 'leetcode',
            handle: info.handle,
            rating: info.rating,
            maxRating: info.rating,
            rank: info.rank,
            totalSolved: info.totalSolved,
            globalRanking: info.globalRanking,
            realName: info.realName,
            titlePhoto: info.titlePhoto
          };

          const key = getUserKey(newUser);
          const existingIdx = state.trackedUsers.findIndex((u) => getUserKey(u) === key);
          if (existingIdx >= 0) state.trackedUsers[existingIdx] = newUser;
          else state.trackedUsers.push(newUser);

          state.activeUserKey = key;
          await chrome.storage.local.set({
            trackedUsers: state.trackedUsers,
            activeUserKey: state.activeUserKey
          });

          elements.handleForm.classList.add('hidden');
          renderMultiUserSection();
        } else {
          alert(`Could not find LeetCode user "${handle}".`);
        }
      } else {
        // Codeforces
        const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`);
        const data = await res.json();

        if (data.status === 'OK' && Array.isArray(data.result) && data.result.length > 0) {
          const u = data.result[0];
          const newUser = {
            platform: 'codeforces',
            handle: u.handle,
            rating: u.rating || 0,
            maxRating: u.maxRating || 0,
            rank: u.rank || 'unrated',
            titlePhoto: u.titlePhoto
          };

          const key = getUserKey(newUser);
          const existingIdx = state.trackedUsers.findIndex((usr) => getUserKey(usr) === key);
          if (existingIdx >= 0) state.trackedUsers[existingIdx] = newUser;
          else state.trackedUsers.push(newUser);

          state.activeUserKey = key;
          await chrome.storage.local.set({
            trackedUsers: state.trackedUsers,
            activeUserKey: state.activeUserKey
          });

          elements.handleForm.classList.add('hidden');
          renderMultiUserSection();
        } else {
          alert(`Could not find Codeforces user "${handle}".`);
        }
      }
    } catch (err) {
      alert(`Network error connecting to ${platform}.`);
    } finally {
      elements.saveHandleBtn.textContent = 'Add User';
    }
  });

  elements.handleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') elements.saveHandleBtn.click();
    else if (e.key === 'Escape') elements.cancelHandleBtn.click();
  });

  // Remove Active User
  elements.removeUserBtn.addEventListener('click', async () => {
    if (!state.activeUserKey) return;
    const active = state.trackedUsers.find((u) => getUserKey(u) === state.activeUserKey);
    if (!active) return;

    const confirmRemove = confirm(`Remove "${active.handle}" (${active.platform}) from tracked users?`);
    if (!confirmRemove) return;

    state.trackedUsers = state.trackedUsers.filter((u) => getUserKey(u) !== state.activeUserKey);
    state.activeUserKey = state.trackedUsers.length > 0 ? getUserKey(state.trackedUsers[0]) : '';

    await chrome.storage.local.set({
      trackedUsers: state.trackedUsers,
      activeUserKey: state.activeUserKey
    });

    renderMultiUserSection();
  });

  // Standings Button
  elements.standingsBtn.addEventListener('click', () => {
    renderStandingsModal();
    elements.standingsModal.classList.remove('hidden');
  });

  elements.closeStandingsBtn.addEventListener('click', () => {
    elements.standingsModal.classList.add('hidden');
  });

  elements.standingsModal.addEventListener('click', (e) => {
    if (e.target === elements.standingsModal) elements.standingsModal.classList.add('hidden');
  });

  // Share Coder Card Modal & Actions
  elements.shareCardBtn.addEventListener('click', () => {
    openShareCardModal();
  });

  elements.closeShareCardBtn.addEventListener('click', () => {
    elements.shareCardModal.classList.add('hidden');
  });

  elements.shareCardModal.addEventListener('click', (e) => {
    if (e.target === elements.shareCardModal) elements.shareCardModal.classList.add('hidden');
  });

  elements.btnDownloadCardPng.addEventListener('click', () => {
    exportCoderCardPng();
  });

  elements.btnCopyBadgeMd.addEventListener('click', () => {
    copyCardBadgesMarkdown();
  });

  elements.btnCopyStatsText.addEventListener('click', () => {
    copyCardStatsText();
  });

  // Settings Dialog
  elements.settingsBtn.addEventListener('click', () => {
    elements.reminderOffsetSelect.value = state.settings.reminderMinutes || 15;
    elements.timeFormatSelect.value = state.settings.timeFormat || '12';
    elements.hideLongContestsSwitch.checked = state.settings.hideLongContests !== false;
    elements.clistUsernameInput.value = state.settings.customClistUsername || '';
    elements.clistApiKeyInput.value = state.settings.customClistApiKey || '';
    if (elements.badgeModeSelect) {
      elements.badgeModeSelect.value = state.settings.badgeMode || 'contests';
    }
    applyThemeAccent(state.settings.themeAccent || 'cyan');
    elements.settingsModal.classList.remove('hidden');
  });

  elements.closeSettingsBtn.addEventListener('click', () => {
    elements.settingsModal.classList.add('hidden');
  });

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
    if (elements.badgeModeSelect) {
      state.settings.badgeMode = elements.badgeModeSelect.value;
    }

    await chrome.storage.local.set({ settings: state.settings });
    chrome.runtime.sendMessage({ type: 'UPDATE_BADGE' }).catch(() => {});

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
 * Keyboard Power Navigation
 */
function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    const inInput = e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT';

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

    if (e.key === 'Escape') {
      if (!elements.settingsModal.classList.contains('hidden')) {
        elements.settingsModal.classList.add('hidden');
        return;
      }
      if (!elements.standingsModal.classList.contains('hidden')) {
        elements.standingsModal.classList.add('hidden');
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

    if (inInput) return;

    if (['1', '2', '3', '4', '5'].includes(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      if (elements.tabItems[idx]) {
        elements.tabItems[idx].click();
      }
      return;
    }

    if (e.key.toLowerCase() === 'r') {
      elements.refreshBtn.click();
      return;
    }

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
 * Direct Codeforces API Fallback
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
    if (state.selectedPlatforms.length > 0 && !state.selectedPlatforms.includes(contest.resource)) {
      return false;
    }

    if (state.settings.hideLongContests && contest.duration > 86400) {
      return false;
    }

    if (state.activeDurFilter === 'short' && contest.duration > 7200) return false;
    if (state.activeDurFilter === 'medium' && (contest.duration <= 7200 || contest.duration > 10800)) return false;
    if (state.activeDurFilter === 'long' && contest.duration <= 10800) return false;

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

let liveArenaTickerInterval = null;

function renderLiveArena() {
  if (!elements.liveArenaBar) return;

  const now = new Date();
  const liveContest = state.contests.find((c) => {
    if (state.selectedPlatforms.length > 0 && !state.selectedPlatforms.includes(c.resource)) return false;
    const start = new Date(c.start.endsWith('Z') ? c.start : c.start + '.000Z');
    const end = new Date(c.end.endsWith('Z') ? c.end : c.end + '.000Z');
    return start <= now && end >= now;
  });

  if (!liveContest) {
    elements.liveArenaBar.classList.add('hidden');
    if (liveArenaTickerInterval) {
      clearInterval(liveArenaTickerInterval);
      liveArenaTickerInterval = null;
    }
    return;
  }

  const conf = PLATFORMS_CONFIG[liveContest.resource] || { name: liveContest.resource, icon: 'logo/icon16.png' };
  elements.liveArenaIcon.src = conf.icon;
  elements.liveArenaPlatform.textContent = conf.name;
  elements.liveArenaName.textContent = liveContest.event;
  elements.liveArenaBtn.href = liveContest.href || '#';

  const end = new Date(liveContest.end.endsWith('Z') ? liveContest.end : liveContest.end + '.000Z');

  function updateTicker() {
    const diffMs = end.getTime() - Date.now();
    if (diffMs <= 0) {
      elements.liveArenaTimer.textContent = 'Round ending now...';
      if (liveArenaTickerInterval) {
        clearInterval(liveArenaTickerInterval);
        liveArenaTickerInterval = null;
      }
      return;
    }
    const sec = Math.floor(diffMs / 1000);
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    elements.liveArenaTimer.textContent = `${h}:${m}:${s} remaining`;
  }

  updateTicker();
  if (liveArenaTickerInterval) clearInterval(liveArenaTickerInterval);
  liveArenaTickerInterval = setInterval(updateTicker, 1000);

  elements.liveArenaBar.classList.remove('hidden');
}

/**
 * Main Render Pipeline
 */
function renderContests() {
  updateTabCounts();
  renderLiveArena();
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
  const isEnded = end < now;
  const isBookmarked = state.bookmarkedIds.includes(contest.id);
  const hasReminder = Boolean(state.reminders && state.reminders[contest.id]);
  const isSelected = index === state.selectedCardIndex;

  let statusBadgeHtml = '';
  if (isLive) {
    const timeLeft = formatDuration((end.getTime() - now.getTime()) / 1000);
    statusBadgeHtml = `<span class="status-pill pill-live"><span class="live-dot-pulse"></span> LIVE &bull; ${timeLeft} left</span>`;
  } else if (isEnded) {
    statusBadgeHtml = `<span class="status-pill pill-ended">Ended</span>`;
  } else {
    const diffSec = (start.getTime() - now.getTime()) / 1000;
    if (diffSec < 86400) {
      statusBadgeHtml = `<span class="status-pill pill-today">\u26A1 In ${formatDuration(diffSec)}</span>`;
    } else {
      const days = Math.floor(diffSec / 86400);
      const hours = Math.floor((diffSec % 86400) / 3600);
      statusBadgeHtml = `<span class="status-pill pill-upcoming">\uD83D\uDFE2 In ${days}d ${hours}h</span>`;
    }
  }

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
      <div class="card-main-row">
        <div class="platform-identity" title="${escapeHtml(conf.name)}">
          <img src="${conf.icon}" alt="" class="platform-logo-img" />
          <span class="platform-name">${escapeHtml(conf.name)}</span>
        </div>
        <div class="card-status-badge">
          ${statusBadgeHtml}
        </div>
      </div>

      <a href="${escapeHtml(contest.href)}" target="_blank" rel="noopener" class="contest-headline" title="${escapeHtml(contest.event)}">
        ${escapeHtml(contest.event)}
      </a>

      <div class="card-footer-row">
        <div class="schedule-info">
          <span class="sched-date"><strong>${datePrefix}</strong> at ${timeString}</span>
          <span class="sched-sep">&bull;</span>
          <span class="sched-dur">⏱️ ${durationString}</span>
        </div>

        <div class="actions-cluster">
          ${isEnded ? `
            <a href="${escapeHtml(contest.href)}" target="_blank" rel="noopener" class="btn-card-upsolve" title="Open archive / Editorial to practice">Upsolve 📝</a>
          ` : `
            <button class="btn-utility cal-trigger-btn" data-id="${contest.id}" title="Add to Google, Outlook or iCal [C]">+ Cal</button>
            <button class="btn-utility reminder-btn ${hasReminder ? 'active-bell' : ''}" data-id="${contest.id}" title="${hasReminder ? 'Cancel Alert' : 'Set 15m Alert [R]'}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="${hasReminder ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <button class="btn-utility star-btn ${isBookmarked ? 'active-star' : ''}" data-id="${contest.id}" title="${isBookmarked ? 'Remove Star [S]' : 'Star Contest [S]'}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
            <a href="${escapeHtml(contest.href)}" target="_blank" rel="noopener" class="link-participate" title="Open contest page [Enter]">
              <span>Enter</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>
          `}
        </div>
      </div>
    </article>
  `;
}

/**
 * Attach Card Action Listeners
 */
function attachCardActionListeners() {
  document.querySelectorAll('.cal-trigger-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const contest = state.contests.find((c) => String(c.id) === String(id));
      if (contest) showCalendarPopover(contest, btn);
    });
  });

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
