"""
CodeRadar - Instagram Launch Asset Generator
Creates ultra-modern, high-converting Instagram graphics:
- 5x Carousel Slides (1080x1350 px, 4:5 vertical portrait for maximum feed visibility)
- 1x Story Graphic (1080x1920 px, 9:16 vertical full screen)
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE_DIR = "c:/Users/sunit/Desktop/cp-calender"
OUTPUT_DIR = os.path.join(BASE_DIR, "instagram_assets")
LOGO_DIR = os.path.join(BASE_DIR, "logo")

FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_REG = "C:/Windows/Fonts/segoeui.ttf"
FONT_SB = "C:/Windows/Fonts/seguisb.ttf"
FONT_MONO = "C:/Windows/Fonts/consolab.ttf"

def get_font(size, style="regular"):
    try:
        if style == "bold":
            return ImageFont.truetype(FONT_BOLD, size)
        elif style == "semibold":
            return ImageFont.truetype(FONT_SB, size)
        elif style == "mono":
            return ImageFont.truetype(FONT_MONO, size)
        else:
            return ImageFont.truetype(FONT_REG, size)
    except:
        return ImageFont.load_default()

def create_base_canvas(width, height, primary_glow=(6, 182, 212), secondary_glow=(139, 92, 246)):
    """Creates a modern cyberpunk/deep slate dark background with ambient radial glows and grid."""
    canvas = Image.new("RGBA", (width, height), (7, 10, 18, 255))
    
    # Glow overlay
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    
    # Glow 1: Top-Right
    gx1, gy1 = int(width * 0.8), int(height * 0.18)
    for r in range(500, 0, -25):
        alpha = int(28 * (1 - r / 500))
        gdraw.ellipse([gx1 - r, gy1 - r, gx1 + r, gy1 + r], fill=(*primary_glow, alpha))
        
    # Glow 2: Bottom-Left
    gx2, gy2 = int(width * 0.2), int(height * 0.82)
    for r in range(450, 0, -25):
        alpha = int(24 * (1 - r / 450))
        gdraw.ellipse([gx2 - r, gy2 - r, gx2 + r, gy2 + r], fill=(*secondary_glow, alpha))
        
    canvas = Image.alpha_composite(canvas, glow)
    draw = ImageDraw.Draw(canvas)
    
    # Tech Grid Lines
    for x in range(0, width, 60):
        draw.line([(x, 0), (x, height)], fill=(255, 255, 255, 6), width=1)
    for y in range(0, height, 60):
        draw.line([(0, y), (width, y)], fill=(255, 255, 255, 6), width=1)
        
    return canvas

def draw_slide_footer(canvas, current_slide, total_slides=5):
    """Draws carousel indicator and swipe callout."""
    draw = ImageDraw.Draw(canvas)
    w, h = canvas.size
    
    # Slide indicator pill
    pill_text = f"{current_slide} / {total_slides}"
    pfont = get_font(18, "bold")
    draw.rounded_rectangle([70, h - 90, 160, h - 45], radius=12, fill=(255, 255, 255, 14), outline=(255, 255, 255, 30), width=1)
    draw.text((92, h - 77), pill_text, font=pfont, fill=(148, 163, 184, 255))
    
    # Right Swipe CTA
    if current_slide < total_slides:
        sfont = get_font(20, "bold")
        draw.text((w - 280, h - 77), "Swipe to see ➡️", font=sfont, fill=(56, 189, 248, 255))
    else:
        sfont = get_font(20, "bold")
        draw.text((w - 380, h - 77), "📌 Save for your next contest", font=sfont, fill=(245, 158, 11, 255))

def draw_window_frame(canvas, x, y, w, h, title="CodeRadar Live Arena"):
    """Draws sleek glassmorphic window frame."""
    shadow = Image.new("RGBA", (w + 40, h + 40), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle([20, 20, w + 20, h + 20], radius=18, fill=(0, 0, 0, 180))
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    canvas.alpha_composite(shadow, (x - 20, y - 20))
    
    win = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    wdraw = ImageDraw.Draw(win)
    wdraw.rounded_rectangle([0, 0, w, h], radius=16, fill=(13, 19, 32, 245), outline=(255, 255, 255, 28), width=1)
    
    # Titlebar
    wdraw.rounded_rectangle([0, 0, w, 46], radius=16, fill=(19, 27, 45, 255))
    wdraw.rectangle([0, 30, w, 46], fill=(19, 27, 45, 255))
    wdraw.line([(0, 46), (w, 46)], fill=(255, 255, 255, 16), width=1)
    
    # Window dots
    wdraw.ellipse([18, 16, 30, 28], fill=(239, 68, 68, 230))
    wdraw.ellipse([36, 16, 48, 28], fill=(245, 158, 11, 230))
    wdraw.ellipse([54, 16, 66, 28], fill=(16, 185, 129, 230))
    
    wdraw.text((82, 14), title, font=get_font(15, "semibold"), fill=(148, 163, 184, 255))
    
    # Live badge
    wdraw.rounded_rectangle([w - 120, 12, w - 20, 34], radius=10, fill=(16, 185, 129, 30), outline=(16, 185, 129, 120), width=1)
    wdraw.ellipse([w - 108, 20, w - 102, 26], fill=(16, 185, 129, 255))
    wdraw.text((w - 94, 15), "ONLINE", font=get_font(12, "bold"), fill=(52, 211, 153, 255))
    
    canvas.alpha_composite(win, (x, y))

def draw_contest_card(canvas, x, y, w, h, platform, title, time_str, countdown_str, is_live=False, color=(6, 182, 212)):
    card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)
    
    bg_col = (20, 30, 50, 245) if not is_live else (26, 38, 64, 255)
    border_col = (*color, 160) if is_live else (255, 255, 255, 22)
    
    draw.rounded_rectangle([0, 0, w, h], radius=12, fill=bg_col, outline=border_col, width=1)
    draw.rounded_rectangle([0, 0, 5, h], radius=2, fill=(*color, 255))
    
    # Platform badge
    draw.rounded_rectangle([18, 16, 18 + len(platform)*9 + 18, 38], radius=6, fill=(*color, 35), outline=(*color, 100), width=1)
    draw.text((26, 19), platform.upper(), font=get_font(13, "bold"), fill=(*color, 255))
    
    # Live or countdown
    if is_live:
        draw.rounded_rectangle([w - 120, 16, w - 18, 38], radius=6, fill=(239, 68, 68, 35), outline=(239, 68, 68, 140), width=1)
        draw.ellipse([w - 108, 24, w - 100, 30], fill=(239, 68, 68, 255))
        draw.text((w - 92, 19), "LIVE NOW", font=get_font(12, "bold"), fill=(248, 113, 113, 255))
    else:
        draw.text((w - 120, 19), countdown_str, font=get_font(14, "mono"), fill=(56, 189, 248, 255))
        
    # Title
    draw.text((18, 48), title, font=get_font(18, "bold"), fill=(248, 250, 252, 255))
    
    # Time
    draw.text((18, 80), time_str, font=get_font(14, "regular"), fill=(148, 163, 184, 255))
    
    # Action buttons
    draw.rounded_rectangle([w - 170, 72, w - 100, 100], radius=8, fill=(255, 255, 255, 14), outline=(255, 255, 255, 30), width=1)
    draw.text((w - 156, 77), "+ Cal", font=get_font(13, "semibold"), fill=(203, 213, 225, 255))
    
    draw.rounded_rectangle([w - 92, 72, w - 18, 100], radius=8, fill=(*color, 220), outline=(*color, 255), width=1)
    draw.text((w - 76, 77), "Join ➜", font=get_font(13, "bold"), fill=(255, 255, 255, 255))
    
    canvas.alpha_composite(card, (x, y))

# ==============================================================================
# SLIDE 1: THE VIRAL HOOK (COVER)
# ==============================================================================
def generate_slide_1():
    canvas = create_base_canvas(1080, 1350, (6, 182, 212), (139, 92, 246))
    draw = ImageDraw.Draw(canvas)
    
    # Eyebrow Tag Pill
    tag_font = get_font(16, "bold")
    draw.rounded_rectangle([70, 70, 360, 112], radius=16, fill=(6, 182, 212, 26), outline=(6, 182, 212, 100), width=1)
    draw.ellipse([88, 86, 98, 96], fill=(6, 182, 212, 255))
    draw.text((108, 81), "CHROME EXTENSION 2026", font=tag_font, fill=(6, 182, 212, 255))
    
    # Viral Main Headline
    h1_font = get_font(52, "bold")
    draw.text((70, 140), "Never Miss A Coding", font=h1_font, fill=(248, 250, 252, 255))
    draw.text((70, 204), "Contest Again. ⚡", font=h1_font, fill=(56, 189, 248, 255))
    
    # Subtitle
    sub_font = get_font(22, "regular")
    draw.text((70, 276), "Real-time radar for LeetCode, Codeforces,", font=sub_font, fill=(148, 163, 184, 255))
    draw.text((70, 310), "CodeChef & AtCoder with 1-click calendar sync.", font=sub_font, fill=(148, 163, 184, 255))
    
    # Floating Extension UI Mockup
    wx, wy, ww, wh = 70, 375, 940, 740
    draw_window_frame(canvas, wx, wy, ww, wh, "CodeRadar Live Arena")
    
    # Inside window: Command Bar
    draw.rounded_rectangle([wx + 24, wy + 62, wx + ww - 24, wy + 112], radius=10, fill=(18, 25, 42, 255), outline=(255, 255, 255, 22), width=1)
    draw.text((wx + 44, wy + 76), "🔍 Search contest name, platform, or division...", font=get_font(16, "regular"), fill=(100, 116, 139, 255))
    
    # Live Arena Ticker Banner
    draw.rounded_rectangle([wx + 24, wy + 126, wx + ww - 24, wy + 180], radius=10, fill=(239, 68, 68, 22), outline=(239, 68, 68, 90), width=1)
    draw.ellipse([wx + 44, wy + 148, wx + 54, wy + 158], fill=(239, 68, 68, 255))
    draw.text((wx + 64, wy + 142), "LIVE NOW: LeetCode Weekly Contest 435 is actively running! Ends in 01h 14m", font=get_font(15, "bold"), fill=(248, 113, 113, 255))
    
    # Contest Cards inside
    cy = wy + 198
    draw_contest_card(canvas, wx + 24, cy, ww - 48, 112, "LeetCode", "Weekly Contest 435", "Today, 08:00 AM - 09:30 AM (90 Mins)", "01:14:22", is_live=True, color=(245, 158, 11))
    draw_contest_card(canvas, wx + 24, cy + 126, ww - 48, 112, "Codeforces", "Codeforces Round 1002 (Div. 2)", "Tomorrow, 08:05 PM - 10:05 PM (2.0 hrs)", "in 14h 20m", is_live=False, color=(59, 130, 246))
    draw_contest_card(canvas, wx + 24, cy + 252, ww - 48, 112, "CodeChef", "Starters 172 (Div. 1, 2, 3, 4)", "Wednesday, 08:00 PM - 10:00 PM (2.0 hrs)", "in 3d 02h", is_live=False, color=(168, 85, 247))
    draw_contest_card(canvas, wx + 24, cy + 378, ww - 48, 112, "AtCoder", "AtCoder Beginner Contest 391", "Saturday, 05:30 PM - 07:10 PM (100 Mins)", "in 5d 21h", is_live=False, color=(16, 185, 129))
    
    # Store availability badge at bottom of mockup
    draw.rounded_rectangle([wx + 24, wy + 665, wx + ww - 24, wy + 715], radius=10, fill=(6, 182, 212, 24), outline=(6, 182, 212, 100), width=1)
    draw.text((wx + 44, wy + 678), "★ Published on Google Chrome Web Store • 100% Free & Open Source", font=get_font(16, "bold"), fill=(6, 182, 212, 255))
    
    draw_slide_footer(canvas, 1, 5)
    canvas.save(os.path.join(OUTPUT_DIR, "slide_1_cover.png"), "PNG")
    print("Slide 1 generated.")

# ==============================================================================
# SLIDE 2: THE PROBLEM & RADAR SOLUTION
# ==============================================================================
def generate_slide_2():
    canvas = create_base_canvas(1080, 1350, (239, 68, 68), (6, 182, 212))
    draw = ImageDraw.Draw(canvas)
    
    # Tag
    draw.rounded_rectangle([70, 70, 310, 112], radius=16, fill=(239, 68, 68, 26), outline=(239, 68, 68, 100), width=1)
    draw.ellipse([88, 86, 98, 96], fill=(239, 68, 68, 255))
    draw.text((108, 81), "THE PROBLEM", font=get_font(16, "bold"), fill=(248, 113, 113, 255))
    
    # Headline
    h1_font = get_font(48, "bold")
    draw.text((70, 140), "Stop Checking 5 Tabs", font=h1_font, fill=(248, 250, 252, 255))
    draw.text((70, 200), "Every Weekend 😫", font=h1_font, fill=(248, 113, 113, 255))
    
    # Problem comparison card
    pbox = Image.new("RGBA", (940, 330), (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(pbox)
    pdraw.rounded_rectangle([0, 0, 940, 330], radius=16, fill=(22, 18, 26, 240), outline=(239, 68, 68, 60), width=1)
    pdraw.rounded_rectangle([0, 0, 6, 330], radius=2, fill=(239, 68, 68, 255))
    
    pdraw.text((36, 30), "The Frustration Every Coder Knows:", font=get_font(24, "bold"), fill=(248, 250, 252, 255))
    
    p_items = [
        "❌ Forgetting if LeetCode Biweekly is Saturday or Sunday",
        "❌ Calculating UTC / GMT timezone offsets in your head",
        "❌ Missing Codeforces Div. 2 rounds by just 10 minutes",
        "❌ Heavy web calendars with 10-second loading spinners"
    ]
    py = 85
    for item in p_items:
        pdraw.text((36, py), item, font=get_font(19, "regular"), fill=(203, 213, 225, 255))
        py += 54
        
    canvas.alpha_composite(pbox, (70, 275))
    
    # The Solution Banner
    sbox = Image.new("RGBA", (940, 520), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(sbox)
    sdraw.rounded_rectangle([0, 0, 940, 520], radius=16, fill=(16, 26, 42, 240), outline=(6, 182, 212, 120), width=1)
    sdraw.rounded_rectangle([0, 0, 6, 520], radius=2, fill=(6, 182, 212, 255))
    
    sdraw.text((36, 30), "How CodeRadar Fixes It: ⚡", font=get_font(26, "bold"), fill=(56, 189, 248, 255))
    
    s_items = [
        ("⚡ 0 Millisecond Latency", "Opens instantly with zero lag. All schedules cached offline."),
        ("🌐 7+ Elite Platforms", "Direct sync for LeetCode, Codeforces, CodeChef, AtCoder, GFG."),
        ("⏰ Auto Local Timezone", "No calculations. Automatically matches your computer's clock."),
        ("🔔 Smart Desktop Reminders", "Alerts you 15m before start time so you never join late.")
    ]
    sy = 85
    for title, desc in s_items:
        sdraw.text((36, sy), title, font=get_font(20, "bold"), fill=(248, 250, 252, 255))
        sdraw.text((36, sy + 30), desc, font=get_font(17, "regular"), fill=(148, 163, 184, 255))
        sy += 98
        
    canvas.alpha_composite(sbox, (70, 645))
    
    draw_slide_footer(canvas, 2, 5)
    canvas.save(os.path.join(OUTPUT_DIR, "slide_2_radar.png"), "PNG")
    print("Slide 2 generated.")

# ==============================================================================
# SLIDE 3: UNIFIED RATING HUD & MULTI-HANDLE
# ==============================================================================
def generate_slide_3():
    canvas = create_base_canvas(1080, 1350, (168, 85, 247), (59, 130, 246))
    draw = ImageDraw.Draw(canvas)
    
    # Tag
    draw.rounded_rectangle([70, 70, 340, 112], radius=16, fill=(168, 85, 247, 26), outline=(168, 85, 247, 100), width=1)
    draw.ellipse([88, 86, 98, 96], fill=(168, 85, 247, 255))
    draw.text((108, 81), "FEATURE SPOTLIGHT", font=get_font(16, "bold"), fill=(192, 132, 252, 255))
    
    # Headline
    h1_font = get_font(48, "bold")
    draw.text((70, 140), "Unified Rating HUD &", font=h1_font, fill=(248, 250, 252, 255))
    draw.text((70, 200), "Multi-Handle Stats 🏆", font=h1_font, fill=(192, 132, 252, 255))
    
    sub_font = get_font(22, "regular")
    draw.text((70, 270), "Track your ratings, Guardian ranks & Master badges", font=sub_font, fill=(148, 163, 184, 255))
    draw.text((70, 304), "across every platform in a single drawer.", font=sub_font, fill=(148, 163, 184, 255))
    
    # Big Developer HUD Mockup Box
    wx, wy, ww, wh = 70, 365, 940, 755
    draw_window_frame(canvas, wx, wy, ww, wh, "CodeRadar - Developer Profile HUD")
    
    # User Profile Pill inside
    draw.rounded_rectangle([wx + 28, wy + 65, wx + ww - 28, wy + 165], radius=14, fill=(24, 34, 56, 255), outline=(255, 255, 255, 30), width=1)
    draw.ellipse([wx + 48, wy + 82, wx + 116, wy + 150], fill=(59, 130, 246, 255), outline=(255, 255, 255, 90), width=2)
    draw.text((wx + 66, wy + 98), "CR", font=get_font(26, "bold"), fill=(255, 255, 255, 255))
    
    draw.text((wx + 136, wy + 88), "alex_coder", font=get_font(24, "bold"), fill=(248, 250, 252, 255))
    draw.text((wx + 136, wy + 122), "Competitive Programmer • Verified Live Sync", font=get_font(15, "regular"), fill=(148, 163, 184, 255))
    
    # 3 Big Platform Rating Rows
    hud_items = [
        ("LeetCode", "alex_lc", "2,145", "GUARDIAN", "Top 1.2% Worldwide • 840 Solved", (245, 158, 11), 84),
        ("Codeforces", "alex_cf", "1,894", "CANDIDATE MASTER", "Peak Rating: 1912 • Div. 1/2", (59, 130, 246), 72),
        ("CodeChef", "alex_cc", "1,980", "4-STAR CODER", "Global Rank #1,420 • Div. 1", (168, 85, 247), 78)
    ]
    
    hy = wy + 185
    for pname, handle, rval, rrank, rsub, rcol, pct in hud_items:
        draw.rounded_rectangle([wx + 28, hy, wx + ww - 28, hy + 135], radius=14, fill=(18, 26, 44, 255), outline=(*rcol, 90), width=1)
        draw.rounded_rectangle([wx + 28, hy, wx + 34, hy + 135], radius=2, fill=(*rcol, 255))
        
        draw.text((wx + 52, hy + 18), pname, font=get_font(20, "bold"), fill=(*rcol, 255))
        draw.text((wx + 52, hy + 46), f"@{handle}", font=get_font(15, "mono"), fill=(148, 163, 184, 255))
        
        # Rating & Badge right
        draw.text((wx + ww - 230, hy + 16), rval, font=get_font(28, "bold"), fill=(248, 250, 252, 255))
        draw.rounded_rectangle([wx + ww - 235, hy + 50, wx + ww - 48, hy + 76], radius=6, fill=(*rcol, 35), outline=(*rcol, 120), width=1)
        draw.text((wx + ww - 222, hy + 54), rrank, font=get_font(12, "bold"), fill=(*rcol, 255))
        
        # Progress Bar
        draw.rounded_rectangle([wx + 52, hy + 86, wx + ww - 48, hy + 96], radius=5, fill=(255, 255, 255, 18))
        bar_len = int((ww - 100) * (pct / 100.0))
        draw.rounded_rectangle([wx + 52, hy + 86, wx + 52 + bar_len, hy + 96], radius=5, fill=(*rcol, 255))
        
        draw.text((wx + 52, hy + 106), rsub, font=get_font(13, "regular"), fill=(100, 116, 139, 255))
        
        hy += 150
        
    # Friend Tracking Highlight
    draw.rounded_rectangle([wx + 28, wy + 650, wx + ww - 28, wy + 725], radius=12, fill=(16, 185, 129, 22), outline=(16, 185, 129, 100), width=1)
    draw.text((wx + 50, wy + 672), "👥 Multi-User Support: Add peer and friend handles to compare ratings in 1 click!", font=get_font(15, "bold"), fill=(52, 211, 153, 255))
    
    draw_slide_footer(canvas, 3, 5)
    canvas.save(os.path.join(OUTPUT_DIR, "slide_3_rating_hud.png"), "PNG")
    print("Slide 3 generated.")

# ==============================================================================
# SLIDE 4: 1-CLICK CALENDAR SYNC & REMINDERS
# ==============================================================================
def generate_slide_4():
    canvas = create_base_canvas(1080, 1350, (16, 185, 129), (6, 182, 212))
    draw = ImageDraw.Draw(canvas)
    
    # Tag
    draw.rounded_rectangle([70, 70, 340, 112], radius=16, fill=(16, 185, 129, 26), outline=(16, 185, 129, 100), width=1)
    draw.ellipse([88, 86, 98, 96], fill=(16, 185, 129, 255))
    draw.text((108, 81), "PRODUCTIVITY HACK", font=get_font(16, "bold"), fill=(52, 211, 153, 255))
    
    # Headline
    h1_font = get_font(48, "bold")
    draw.text((70, 140), "1-Click Calendar Sync &", font=h1_font, fill=(248, 250, 252, 255))
    draw.text((70, 200), "Smart Alarms 📅", font=h1_font, fill=(52, 211, 153, 255))
    
    sub_font = get_font(22, "regular")
    draw.text((70, 270), "Sync upcoming rounds directly into your personal", font=sub_font, fill=(148, 163, 184, 255))
    draw.text((70, 304), "Google Calendar, Outlook, or Apple iCal.", font=sub_font, fill=(148, 163, 184, 255))
    
    # Big Showcase Container
    wx, wy, ww, wh = 70, 365, 940, 755
    draw_window_frame(canvas, wx, wy, ww, wh, "CodeRadar - Calendar Export & Alarms")
    
    # Contest Preview inside
    draw.rounded_rectangle([wx + 28, wy + 65, wx + ww - 28, wy + 175], radius=14, fill=(22, 32, 52, 255), outline=(245, 158, 11, 120), width=1)
    draw.rounded_rectangle([wx + 28, wy + 65, wx + 34, wy + 175], radius=2, fill=(245, 158, 11, 255))
    
    draw.text((wx + 52, wy + 82), "LeetCode Weekly Contest 435", font=get_font(22, "bold"), fill=(248, 250, 252, 255))
    draw.text((wx + 52, wy + 114), "Sunday • 08:00 AM - 09:30 AM IST (1.5 Hours)", font=get_font(16, "regular"), fill=(148, 163, 184, 255))
    draw.text((wx + 52, wy + 142), "Auto-includes official problem arena URL & reminder triggers", font=get_font(14, "mono"), fill=(245, 158, 11, 220))
    
    # 3 Calendar Sync Options
    cal_providers = [
        ("Google Calendar", "Instant 1-click cloud sync with phone alerts", (66, 133, 244), "Sync to Google Calendar ➜"),
        ("Outlook / Office 365", "Corporate and university calendar export", (0, 120, 212), "Sync to Outlook ➜"),
        ("Apple Calendar / .ICS", "Universal standard calendar file for iOS & macOS", (16, 185, 129), "Download .ICS File ➜")
    ]
    
    cy = wy + 195
    for ctitle, cdesc, ccol, cbtn in cal_providers:
        draw.rounded_rectangle([wx + 28, cy, wx + ww - 28, cy + 130], radius=12, fill=(18, 26, 44, 255), outline=(255, 255, 255, 24), width=1)
        
        draw.ellipse([wx + 50, cy + 24, wx + 86, cy + 60], fill=(*ccol, 40), outline=(*ccol, 160), width=1)
        draw.text((wx + 62, cy + 30), "📅", font=get_font(15, "regular"), fill=(255, 255, 255, 255))
        
        draw.text((wx + 104, cy + 22), ctitle, font=get_font(20, "bold"), fill=(248, 250, 252, 255))
        draw.text((wx + 104, cy + 50), cdesc, font=get_font(15, "regular"), fill=(148, 163, 184, 255))
        
        draw.rounded_rectangle([wx + 104, cy + 78, wx + 420, cy + 114], radius=8, fill=(*ccol, 210), outline=(*ccol, 255), width=1)
        draw.text((wx + 120, cy + 85), cbtn, font=get_font(14, "bold"), fill=(255, 255, 255, 255))
        
        cy += 145
        
    # Notification Banner
    draw.rounded_rectangle([wx + 28, wy + 650, wx + ww - 28, wy + 725], radius=12, fill=(16, 185, 129, 22), outline=(16, 185, 129, 120), width=1)
    draw.text((wx + 50, wy + 672), "🔔 Native Chrome Alarm: Auto-notifies 15 minutes before any round begins!", font=get_font(15, "bold"), fill=(52, 211, 153, 255))
    
    draw_slide_footer(canvas, 4, 5)
    canvas.save(os.path.join(OUTPUT_DIR, "slide_4_calendar_sync.png"), "PNG")
    print("Slide 4 generated.")

# ==============================================================================
# SLIDE 5: CALL TO ACTION (HOW TO GET IT)
# ==============================================================================
def generate_slide_5():
    canvas = create_base_canvas(1080, 1350, (6, 182, 212), (16, 185, 129))
    draw = ImageDraw.Draw(canvas)
    
    # Tag
    draw.rounded_rectangle([70, 70, 310, 112], radius=16, fill=(16, 185, 129, 26), outline=(16, 185, 129, 100), width=1)
    draw.ellipse([88, 86, 98, 96], fill=(16, 185, 129, 255))
    draw.text((108, 81), "OFFICIAL RELEASE", font=get_font(16, "bold"), fill=(52, 211, 153, 255))
    
    # Headline
    h1_font = get_font(52, "bold")
    draw.text((70, 140), "Install CodeRadar", font=h1_font, fill=(248, 250, 252, 255))
    draw.text((70, 204), "For Free Today! 🚀", font=h1_font, fill=(52, 211, 153, 255))
    
    # Central Card
    cbox = Image.new("RGBA", (940, 520), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(cbox)
    cdraw.rounded_rectangle([0, 0, 940, 520], radius=20, fill=(18, 26, 44, 245), outline=(6, 182, 212, 120), width=2)
    
    # Center Chrome Web Store Logo & Badge
    cdraw.text((50, 45), "Available On Google Chrome Web Store", font=get_font(26, "bold"), fill=(248, 250, 252, 255))
    cdraw.text((50, 85), "Search 'CodeRadar' or grab the direct link in the comments!", font=get_font(18, "regular"), fill=(148, 163, 184, 255))
    
    # Big Action Steps Box
    steps = [
        ("1️⃣  Open Chrome Web Store", "Search 'CodeRadar' or click the link in bio / comments"),
        ("2️⃣  Click 'Add to Chrome'", "Installs in 3 seconds with zero registration or signups"),
        ("3️⃣  Pin CodeRadar to Toolbar", "Get live contest badges and rating HUD on every tab"),
        ("4️⃣  Sync Your Next Contest", "Add upcoming rounds directly to Google Calendar")
    ]
    
    sty = 145
    for snum, sdesc in steps:
        cdraw.rounded_rectangle([50, sty, 890, sty + 74], radius=10, fill=(24, 34, 56, 255), outline=(255, 255, 255, 20), width=1)
        cdraw.text((70, sty + 14), snum, font=get_font(18, "bold"), fill=(56, 189, 248, 255))
        cdraw.text((70, sty + 42), sdesc, font=get_font(14, "regular"), fill=(203, 213, 225, 255))
        sty += 86
        
    canvas.alpha_composite(cbox, (70, 290))
    
    # Link Highlight Box
    lbox = Image.new("RGBA", (940, 280), (0, 0, 0, 0))
    ldraw = ImageDraw.Draw(lbox)
    ldraw.rounded_rectangle([0, 0, 940, 280], radius=18, fill=(245, 158, 11, 20), outline=(245, 158, 11, 120), width=1)
    
    ldraw.text((45, 35), "🔗 DIRECT EXTENSION LINK:", font=get_font(20, "bold"), fill=(245, 158, 11, 255))
    ldraw.text((45, 75), "Pinned in the comments below! 👇", font=get_font(28, "bold"), fill=(248, 250, 252, 255))
    ldraw.text((45, 120), "Also available in bio link & on GitHub (Open Source)", font=get_font(17, "regular"), fill=(148, 163, 184, 255))
    
    # Save & Share prompt
    ldraw.rounded_rectangle([45, 175, 895, 245], radius=10, fill=(245, 158, 11, 220))
    ldraw.text((180, 196), "📌 SAVE THIS POST & SHARE WITH YOUR CP BUDDIES!", font=get_font(18, "bold"), fill=(15, 23, 42, 255))
    
    canvas.alpha_composite(lbox, (70, 840))
    
    draw_slide_footer(canvas, 5, 5)
    canvas.save(os.path.join(OUTPUT_DIR, "slide_5_cta.png"), "PNG")
    print("Slide 5 generated.")

# ==============================================================================
# STORY GRAPHIC: 1080x1920 (9:16 VERTICAL FULL SCREEN)
# ==============================================================================
def generate_story():
    canvas = create_base_canvas(1080, 1920, (6, 182, 212), (139, 92, 246))
    draw = ImageDraw.Draw(canvas)
    
    # Top Tag
    draw.rounded_rectangle([70, 110, 360, 160], radius=20, fill=(6, 182, 212, 30), outline=(6, 182, 212, 120), width=1)
    draw.ellipse([92, 128, 104, 140], fill=(6, 182, 212, 255))
    draw.text((118, 122), "NEW TOOL RELEASE ⚡", font=get_font(18, "bold"), fill=(6, 182, 212, 255))
    
    # Huge Headline
    draw.text((70, 195), "CodeRadar", font=get_font(68, "bold"), fill=(248, 250, 252, 255))
    draw.text((70, 280), "The Ultimate Contest Tracker", font=get_font(30, "bold"), fill=(56, 189, 248, 255))
    draw.text((70, 325), "For Competitive Coders & DSA Grinders", font=get_font(20, "regular"), fill=(148, 163, 184, 255))
    
    # Extension Mockup in Story Center
    wx, wy, ww, wh = 70, 400, 940, 840
    draw_window_frame(canvas, wx, wy, ww, wh, "CodeRadar Live Arena")
    
    draw_contest_card(canvas, wx + 24, wy + 70, ww - 48, 120, "LeetCode", "Weekly Contest 435", "Today, 08:00 AM - 09:30 AM (90 Mins)", "01:14:22", is_live=True, color=(245, 158, 11))
    draw_contest_card(canvas, wx + 24, wy + 210, ww - 48, 120, "Codeforces", "Codeforces Round 1002 (Div. 2)", "Tomorrow, 08:05 PM - 10:05 PM (2.0 hrs)", "in 14h 20m", is_live=False, color=(59, 130, 246))
    draw_contest_card(canvas, wx + 24, wy + 350, ww - 48, 120, "CodeChef", "Starters 172 (Div. 1, 2, 3, 4)", "Wednesday, 08:00 PM - 10:00 PM (2.0 hrs)", "in 3d 02h", is_live=False, color=(168, 85, 247))
    draw_contest_card(canvas, wx + 24, wy + 490, ww - 48, 120, "AtCoder", "AtCoder Beginner Contest 391", "Saturday, 05:30 PM - 07:10 PM (100 Mins)", "in 5d 21h", is_live=False, color=(16, 185, 129))
    
    # Features List in Window
    draw.rounded_rectangle([wx + 24, wy + 630, wx + ww - 24, wy + 810], radius=12, fill=(18, 26, 44, 255), outline=(255, 255, 255, 20), width=1)
    draw.text((wx + 44, wy + 650), "✓ Multi-Platform Rating HUD (LeetCode Guardian, CF Master)", font=get_font(17, "bold"), fill=(248, 250, 252, 255))
    draw.text((wx + 44, wy + 688), "✓ 1-Click Google Calendar Sync & Desktop Alarms", font=get_font(17, "bold"), fill=(52, 211, 153, 255))
    draw.text((wx + 44, wy + 726), "✓ Zero Latency, 100% Client-Side & Free on Chrome Store", font=get_font(17, "bold"), fill=(56, 189, 248, 255))
    draw.text((wx + 44, wy + 764), "✓ Instant Search, Duration Filters & Starred Watchlist", font=get_font(17, "bold"), fill=(245, 158, 11, 255))
    
    # Story Link Sticker Mockup Box
    draw.rounded_rectangle([140, 1340, 940, 1520], radius=24, fill=(255, 255, 255, 255))
    draw.text((540, 1390), "🔗 GET CODERADAR", font=get_font(30, "bold"), fill=(15, 23, 42, 255), anchor="mm")
    draw.text((540, 1450), "chromewebstore.google.com", font=get_font(18, "semibold"), fill=(100, 116, 139, 255), anchor="mm")
    
    # Bottom callout
    draw.text((540, 1620), "👆 Tap the link sticker above to install for free!", font=get_font(24, "bold"), fill=(248, 250, 252, 255), anchor="mm")
    draw.text((540, 1670), "Available now on Google Chrome Web Store", font=get_font(18, "regular"), fill=(148, 163, 184, 255), anchor="mm")
    
    canvas.save(os.path.join(OUTPUT_DIR, "story_1080x1920.png"), "PNG")
    print("Story graphic generated.")

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("Generating Instagram promotional assets...")
    generate_slide_1()
    generate_slide_2()
    generate_slide_3()
    generate_slide_4()
    generate_slide_5()
    generate_story()
    print("All Instagram assets generated successfully!")
