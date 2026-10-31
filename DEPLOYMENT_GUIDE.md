# Complete Chrome Web Store Deployment Guide for CodeRadar

Follow this step-by-step walkthrough to test locally, package, and publish your new extension to the **Google Chrome Web Store**.

---

## Stage 1: Test Locally in Developer Mode

Before submitting to the store, verify the extension runs smoothly on your own Google Chrome browser:

1. Open **Google Chrome**.
2. Navigate to `chrome://extensions` in the address bar.
3. In the top right corner, toggle on **Developer mode**.
4. Click the **Load unpacked** button in the top left.
5. Select the project folder:
   ```
   C:\Users\sunit\Desktop\cp-calender
   ```
6. You will see **CodeRadar - Coding Contests & CP Calendar** appear in your extension list with its new cyan/indigo radar icon.
7. Click the extension icon in your Chrome toolbar:
   - Verify contests load smoothly from LeetCode, Codeforces, AtCoder, CodeChef.
   - Test the search bar (e.g. type `Div. 2` or `Weekly`).
   - Test toggling platform chips.
   - Click **+ Sync** to test 1-click Google Calendar integration.
   - Click the ⭐ star to test bookmarking.
   - Click **Remind** to test the desktop alarm reminder.

---

## Stage 2: Create a Chrome Web Store Developer Account

If you don't already have a Chrome Developer account:

1. Visit the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Sign in with your Google Account.
3. Pay the **one-time registration fee of $5 USD** (required by Google to prevent spam accounts).
4. Fill in your developer profile name and email address.

---

## Stage 3: Build the Production Store Package (.ZIP)

We included an automated packaging script that bundles only the required production files and excludes git files, documentation, and legacy code:

1. Open PowerShell and run:
   ```powershell
   cd C:\Users\sunit\Desktop\cp-calender
   .\package.ps1
   ```
2. Your store-ready ZIP archive will be created at:
   ```
   C:\Users\sunit\Desktop\cp-calender\dist\code-radar-v1.0.0.zip
   ```
   *(File size is ~310 KB, lightweight and fast to upload!)*

---

## Stage 4: Upload and Configure in Developer Dashboard

1. In the [Developer Dashboard](https://chrome.google.com/webstore/devconsole), click **Add new item** (+ New Item).
2. Drag and drop `dist/code-radar-v1.0.0.zip` into the upload box.
3. Chrome will automatically parse `manifest.json` and create your extension listing.

---

## Stage 5: Upload Store Visual Assets

Navigate to the **Store listing** tab in the dashboard and upload the pre-generated visual assets located in `c:\Users\sunit\Desktop\cp-calender\store_assets\`:

| Asset Requirement | Dimension | Source File to Upload |
| :--- | :--- | :--- |
| **Store Icon** | 128x128 or 512x512 | `store_assets/icon512.png` |
| **Screenshot 1** | 1280x800 | `store_assets/screenshot_1280x800.png` |
| **Small Promo Tile** | 440x280 | `store_assets/promo_small_440x280.png` |
| **Marquee Promo Tile** | 1400x560 | `store_assets/promo_marquee_1400x560.png` |

---

## Stage 6: Fill Store Listing Text & Privacy Questionnaire

Open `STORE_LISTING.md` in the project root. It contains the exact copy-paste text for every single field:

1. **Title:** `CodeRadar - Coding Contests & CP Calendar`
2. **Summary:** `Never miss a coding contest! Live schedule & alerts for LeetCode, Codeforces, CodeChef, AtCoder. 1-click Google Calendar sync.`
3. **Description:** Copy the full Markdown description from `STORE_LISTING.md`.
4. **Category:** Select `Developer Tools`.
5. **Privacy Tab Questionnaire:**
   - **Single Purpose:** Paste the exact answer from `STORE_LISTING.md` section 4.
   - **Permissions Justifications:** Paste the exact justifications for `storage`, `alarms`, `notifications`, and host permissions from `STORE_LISTING.md` section 5.
   - **User Data:** Check "No" for all questions asking if you collect personally identifiable info, financial info, health info, etc.
   - **Privacy Policy URL:** Host `privacy_policy.html` on GitHub Pages (e.g. `https://<your-username>.github.io/<repo>/privacy_policy.html`) or Notion / paste into the Privacy field.

---

## Stage 7: Submit for Review

1. Click **Submit for Review** in the top right.
2. Select whether to publish automatically upon approval or publish manually.
3. Review timeframe:
   - Manifest V3 extensions with clean code and no external tracking typically get approved in **12 to 48 hours**.
4. Once approved, you will receive a direct Chrome Web Store URL to share on LinkedIn, GitHub, Reddit, and Twitter!
