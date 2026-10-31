# Privacy Policy for CodeRadar

**Last Updated: November 1, 2026**

CodeRadar ("we", "our", or "the extension") is an open-source browser extension developed for competitive programmers, engineers, and students. We are committed to protecting your privacy. This Privacy Policy explains our practices regarding user information.

---

## 1. Information Collection and Usage

**CodeRadar does NOT collect, transmit, sell, or monetize any personal data.**

- **No Personal Identifiable Information (PII):** We do not collect names, email addresses, phone numbers, IP addresses, browsing histories, or search queries.
- **No User Accounts:** You do not need to register, create an account, or authenticate to use CodeRadar.
- **No Analytics / Telemetry:** We do not include third-party trackers, Google Analytics, telemetry beacons, or advertising SDKs.

---

## 2. Local Storage and Data Persistence

CodeRadar utilizes Chrome's local storage API (`chrome.storage.local`) exclusively on your device to store:
- User-selected platform filter preferences (e.g., Codeforces, LeetCode, CodeChef, AtCoder).
- User reminder settings (e.g., 15 minutes before contest).
- Locally bookmarked contest IDs ("Starred" contests).
- Cached public contest schedules to allow instant offline rendering.

This data never leaves your device and is never sent to any external server. You can clear this data at any time by removing the extension or clearing extension data in your browser settings.

---

## 3. Network Communications

CodeRadar only communicates with trusted public contest APIs to fetch public schedule data:
- **CLIST.by API (`https://clist.by`):** Used to retrieve public contest dates, platform names, and official contest URLs.
- **Codeforces Official API (`https://codeforces.com`):** Used as a secondary public fallback for Codeforces rounds.

No user cookies, session tokens, or personal identifiers are sent during these network requests.

---

## 4. Permissions Explanation

In accordance with Google Chrome Web Store policies, CodeRadar requests only the minimal permissions required for its functionality:
- **`storage`**: Saves your UI preferences and bookmarks locally on your machine.
- **`alarms`**: Enables background scheduling so desktop reminders fire on time before a contest begins.
- **`notifications`**: Displays local desktop notifications when a contest reminder is reached.
- **Host permissions (`https://clist.by/*`, `https://codeforces.com/*`)**: Fetches contest schedule data.

---

## 5. Contact & Open Source

CodeRadar is open source. If you have questions about this Privacy Policy, please open an issue on our GitHub repository.
