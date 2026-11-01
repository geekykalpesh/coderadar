/**
 * CodeRadar - Background Service Worker (Manifest V3)
 * Handles alarms, background contest sync, desktop notifications, and extension badge counts.
 */

const DEFAULT_PLATFORMS = [
  'codeforces.com',
  'leetcode.com',
  'codechef.com',
  'atcoder.jp',
  'geeksforgeeks.org',
  'hackerearth.com',
  'topcoder.com',
  'naukri.com/code360'
];

const DEFAULT_SETTINGS = {
  selectedPlatforms: DEFAULT_PLATFORMS,
  reminderMinutes: 15,
  hideLongContests: true, // Hides contests > 24 hours by default
  customClistUsername: '',
  customClistApiKey: '',
  bookmarkedIds: [],
  reminders: {} // contestId -> { event, start, resource, href }
};

// Initialize extension on install or update
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[CodeRadar] Extension installed/updated:', details.reason);

  const stored = await chrome.storage.local.get(['settings']);
  if (!stored.settings) {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
  }

  // Set recurring background sync alarm (every 120 minutes)
  chrome.alarms.create('sync_contests', {
    periodInMinutes: 120,
    delayInMinutes: 1
  });

  // Run initial fetch
  syncContestData();
});

// Periodic alarm and contest reminder listener
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'sync_contests') {
    console.log('[CodeRadar] Running scheduled contest sync...');
    await syncContestData();
  } else if (alarm.name.startsWith('contest_reminder_')) {
    const contestId = alarm.name.replace('contest_reminder_', '');
    handleContestReminder(contestId);
  }
});

// Notification click handler -> opens contest URL
chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (notificationId.startsWith('notify_contest_')) {
    const contestId = notificationId.replace('notify_contest_', '');
    const data = await chrome.storage.local.get(['settings', 'contests']);
    const reminder = data.settings?.reminders?.[contestId];
    if (reminder && reminder.href) {
      chrome.tabs.create({ url: reminder.href });
    }
    chrome.notifications.clear(notificationId);
  }
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scheduleReminder') {
    scheduleReminderAlarm(request.contest, request.minutesBefore)
      .then((res) => sendResponse({ success: true, res }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // async response
  } else if (request.action === 'cancelReminder') {
    cancelReminderAlarm(request.contestId)
      .then((res) => sendResponse({ success: true, res }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  } else if (request.action === 'syncNow') {
    syncContestData()
      .then((contests) => sendResponse({ success: true, contests }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

/**
 * Schedule native alarm for a contest
 */
async function scheduleReminderAlarm(contest, minutesBefore = 15) {
  const startTime = new Date(contest.start.endsWith('Z') ? contest.start : contest.start + '.000Z').getTime();
  const reminderTime = startTime - (minutesBefore * 60 * 1000);
  const now = Date.now();

  if (reminderTime <= now) {
    throw new Error('Contest is already starting or has begun');
  }

  const alarmName = `contest_reminder_${contest.id}`;
  await chrome.alarms.create(alarmName, { when: reminderTime });

  // Persist reminder in storage
  const data = await chrome.storage.local.get(['settings']);
  const settings = data.settings || DEFAULT_SETTINGS;
  if (!settings.reminders) settings.reminders = {};
  settings.reminders[contest.id] = {
    id: contest.id,
    event: contest.event,
    start: contest.start,
    resource: contest.resource,
    href: contest.href,
    minutesBefore
  };

  await chrome.storage.local.set({ settings });
  console.log(`[CodeRadar] Alarm scheduled for contest: ${contest.event} at ${new Date(reminderTime).toLocaleTimeString()}`);
}

/**
 * Cancel a scheduled reminder
 */
async function cancelReminderAlarm(contestId) {
  const alarmName = `contest_reminder_${contestId}`;
  await chrome.alarms.clear(alarmName);

  const data = await chrome.storage.local.get(['settings']);
  const settings = data.settings || DEFAULT_SETTINGS;
  if (settings.reminders && settings.reminders[contestId]) {
    delete settings.reminders[contestId];
    await chrome.storage.local.set({ settings });
  }
  console.log(`[CodeRadar] Cleared alarm for contest ${contestId}`);
}

/**
 * Trigger desktop notification when alarm fires
 */
async function handleContestReminder(contestId) {
  const data = await chrome.storage.local.get(['settings']);
  const reminder = data.settings?.reminders?.[contestId];

  if (!reminder) return;

  const title = `🚨 Contest Starting Soon!`;
  const message = `${reminder.event} on ${reminder.resource} starts in ${reminder.minutesBefore || 15} minutes! Click to open.`;

  chrome.notifications.create(`notify_contest_${contestId}`, {
    type: 'basic',
    iconUrl: 'logo/icon128.png',
    title: title,
    message: message,
    contextMessage: 'CodeRadar Contest Radar',
    priority: 2,
    requireInteraction: true
  });

  // Clean up completed reminder
  delete data.settings.reminders[contestId];
  await chrome.storage.local.set({ settings: data.settings });
}

/**
 * Sync contest data in the background and update badge text
 */
async function syncContestData() {
  try {
    const data = await chrome.storage.local.get(['settings']);
    const settings = data.settings || DEFAULT_SETTINGS;

    const username = settings.customClistUsername || 'karanarjunjr';
    const apiKey = settings.customClistApiKey || '32b0dc3d2ed2ee0e8ad5eb7dfe37c47e4da8abb4';
    const resources = settings.selectedPlatforms || DEFAULT_PLATFORMS;

    const now = new Date();
    const nowIso = now.toISOString().substring(0, 19);

    const url = `https://clist.by:443/api/v4/contest/?username=${username}&api_key=${apiKey}&format=json&order_by=start&limit=100&end__gt=${nowIso}&resource__in=${encodeURIComponent(resources.join(','))}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from Clist API`);
    }

    const json = await response.json();
    const contests = json.objects || [];

    // Cache contests
    await chrome.storage.local.set({
      contests: contests,
      lastSynced: Date.now()
    });

    // Update extension badge: number of live contests or contests today
    updateBadge(contests);

    return contests;
  } catch (err) {
    console.warn('[CodeRadar] Clist sync failed, trying fallback...', err);
    return [];
  }
}

/**
 * Update the extension icon badge
 */
async function updateBadge(contests) {
  try {
    const data = await chrome.storage.local.get(['settings', 'trackedUsers', 'activeUserKey', 'contests']);
    const settings = data.settings || {};
    const badgeMode = settings.badgeMode || 'contests';
    const contestList = Array.isArray(contests) && contests.length > 0 ? contests : (data.contests || []);

    if (badgeMode === 'none') {
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setTitle({ title: 'CodeRadar - Coding Contests Tracker' });
      return;
    }

    if (badgeMode === 'rating') {
      const users = data.trackedUsers || [];
      const active = users.find(u => `${u.platform || 'codeforces'}:${(u.handle || '').toLowerCase()}` === data.activeUserKey) || users[0];
      if (active && active.rating) {
        const text = active.rating > 9999 ? `${Math.round(active.rating / 1000)}k` : `${active.rating}`;
        chrome.action.setBadgeText({ text });
        chrome.action.setBadgeBackgroundColor({ color: '#6366F1' });
        chrome.action.setTitle({ title: `CodeRadar: ${active.handle} (${active.platform}) Rating ${active.rating}` });
        return;
      }
    }

    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    let liveCount = 0;
    let todayCount = 0;

    for (const c of contestList) {
      const start = new Date(c.start.endsWith('Z') ? c.start : c.start + '.000Z');
      const end = new Date(c.end.endsWith('Z') ? c.end : c.end + '.000Z');

      if (start <= now && end >= now) {
        liveCount++;
      } else if (start > now && start <= next24h) {
        todayCount++;
      }
    }

    if (liveCount > 0) {
      chrome.action.setBadgeText({ text: liveCount > 1 ? `${liveCount}` : 'LIVE' });
      chrome.action.setBadgeBackgroundColor({ color: '#EF4444' }); // Red for live
      chrome.action.setTitle({ title: `CodeRadar: ${liveCount} contest(s) LIVE NOW!` });
    } else if (badgeMode === 'live_only') {
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setTitle({ title: 'CodeRadar - Coding Contests Tracker' });
    } else if (todayCount > 0) {
      chrome.action.setBadgeText({ text: `${todayCount}` });
      chrome.action.setBadgeBackgroundColor({ color: '#38BDF8' }); // Cyan for today
      chrome.action.setTitle({ title: `CodeRadar: ${todayCount} contest(s) in next 24 hours` });
    } else {
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setTitle({ title: 'CodeRadar - Coding Contests Tracker' });
    }
  } catch (e) {
    console.warn('[CodeRadar] Error updating badge:', e);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'UPDATE_BADGE') {
    updateBadge();
    sendResponse({ ok: true });
  }
});
