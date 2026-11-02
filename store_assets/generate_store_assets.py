"""
CodeRadar - Chrome Web Store Asset Generator
Creates ultra-premium, high-resolution promotional graphics:
- 5x 1280x800 Showcase Screenshots
- 1x 1400x560 Marquee Hero Banner
- 1x 440x280 Small Promo Tile
- 1x 512x512 High-Res Icon
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE_DIR = "c:/Users/sunit/Desktop/cp-calender"
OUTPUT_DIR = os.path.join(BASE_DIR, "store_assets")
IMAGES_DIR = os.path.join(BASE_DIR, "images")
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
    canvas = Image.new("RGBA", (width, height), (7, 10, 17, 255))
    
    # Glow overlay
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    
    # Top-right glow
    gx1, gy1 = int(width * 0.78), int(height * 0.22)
    for r in range(480, 0, -20):
        alpha = int(22 * (1 - r / 480))
        gdraw.ellipse([gx1 - r, gy1 - r, gx1 + r, gy1 + r], fill=(*primary_glow, alpha))
        
    # Bottom-left glow
    gx2, gy2 = int(width * 0.22), int(height * 0.85)
    for r in range(400, 0, -20):
        alpha = int(18 * (1 - r / 400))
        gdraw.ellipse([gx2 - r, gy2 - r, gx2 + r, gy2 + r], fill=(*secondary_glow, alpha))
        
    canvas = Image.alpha_composite(canvas, glow)
    draw = ImageDraw.Draw(canvas)
    
    # Grid overlay
    grid_spacing = 48
    for x in range(0, width, grid_spacing):
        draw.line([(x, 0), (x, height)], fill=(255, 255, 255, 8), width=1)
    for y in range(0, height, grid_spacing):
        draw.line([(0, y), (width, y)], fill=(255, 255, 255, 8), width=1)
        
    return canvas

def draw_header_section(canvas, tag_text, title_text, subtitle_text, tag_color=(6, 182, 212)):
    """Renders consistent, high-converting header copy at top of screenshot."""
    draw = ImageDraw.Draw(canvas)
    
    # 1. Eyebrow Tag Pill
    tag_font = get_font(13, "bold")
    bbox = tag_font.getbbox(tag_text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    px, py = 80, 52
    pw, ph = tw + 28, 30
    
    # Pill bg + border
    pill_img = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(pill_img)
    pdraw.rounded_rectangle([0, 0, pw, ph], radius=15, fill=(*tag_color, 24), outline=(*tag_color, 90), width=1)
    canvas.alpha_composite(pill_img, (px, py))
    
    # Pill dot + text
    draw = ImageDraw.Draw(canvas)
    draw.ellipse([px + 12, py + 11, px + 18, py + 17], fill=(*tag_color, 255))
    draw.text((px + 24, py + 7), tag_text, font=tag_font, fill=(*tag_color, 255))
    
    # 2. Main Headline
    title_font = get_font(38, "bold")
    draw.text((80, 95), title_text, font=title_font, fill=(248, 250, 252, 255))
    
    # 3. Subtitle
    sub_font = get_font(17, "regular")
    draw.text((80, 146), subtitle_text, font=sub_font, fill=(148, 163, 184, 255))

def draw_window_frame(canvas, x, y, w, h, title="CodeRadar - Contest Radar"):
    """Draws macOS/modern dark glassmorphic window frame."""
    draw = ImageDraw.Draw(canvas)
    
    # Shadow
    shadow = Image.new("RGBA", (w + 40, h + 40), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle([20, 20, w + 20, h + 20], radius=16, fill=(0, 0, 0, 160))
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    canvas.alpha_composite(shadow, (x - 20, y - 20))
    
    # Window Body
    win_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    wdraw = ImageDraw.Draw(win_img)
    wdraw.rounded_rectangle([0, 0, w, h], radius=14, fill=(13, 18, 30, 245), outline=(255, 255, 255, 28), width=1)
    
    # Titlebar header
    wdraw.rounded_rectangle([0, 0, w, 40], radius=14, fill=(19, 26, 42, 255))
    wdraw.rectangle([0, 26, w, 40], fill=(19, 26, 42, 255)) # Square out bottom corners of titlebar
    wdraw.line([(0, 40), (w, 40)], fill=(255, 255, 255, 18), width=1)
    
    # 3 Dots
    wdraw.ellipse([14, 14, 24, 24], fill=(239, 68, 68, 230))
    wdraw.ellipse([30, 14, 40, 24], fill=(245, 158, 11, 230))
    wdraw.ellipse([46, 14, 56, 24], fill=(16, 185, 129, 230))
    
    # Window Title
    tfont = get_font(12, "semibold")
    wdraw.text((70, 13), title, font=tfont, fill=(148, 163, 184, 255))
    
    # Live status badge right
    sfont = get_font(11, "bold")
    wdraw.rounded_rectangle([w - 95, 10, w - 16, 30], radius=10, fill=(16, 185, 129, 30), outline=(16, 185, 129, 120), width=1)
    wdraw.ellipse([w - 85, 18, w - 79, 24], fill=(16, 185, 129, 255))
    wdraw.text((w - 72, 13), "ONLINE", font=sfont, fill=(52, 211, 153, 255))
    
    canvas.alpha_composite(win_img, (x, y))

def get_platform_color(platform):
    p = platform.lower()
    if "codeforces" in p:
        return (59, 130, 246) # Blue
    elif "leetcode" in p:
        return (245, 158, 11) # Orange/Gold
    elif "codechef" in p:
        return (168, 85, 247) # Violet/Purple
    elif "atcoder" in p:
        return (16, 185, 129) # Emerald
    return (6, 182, 212)

def draw_contest_card_mockup(canvas, x, y, w, h, platform, title, time_str, countdown_str, is_live=False):
    """Renders a sleek high-density contest card."""
    card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)
    
    pcol = get_platform_color(platform)
    bg_col = (20, 29, 47, 240) if not is_live else (24, 35, 58, 255)
    border_col = (*pcol, 160) if is_live else (255, 255, 255, 20)
    
    draw.rounded_rectangle([0, 0, w, h], radius=10, fill=bg_col, outline=border_col, width=1)
    
    # Left vertical accent bar
    draw.rounded_rectangle([0, 0, 4, h], radius=2, fill=(*pcol, 255))
    
    # Platform badge
    pb_font = get_font(11, "bold")
    draw.rounded_rectangle([14, 12, 14 + len(platform)*7 + 16, 30], radius=5, fill=(*pcol, 35), outline=(*pcol, 100), width=1)
    draw.text((22, 14), platform.upper(), font=pb_font, fill=(*pcol, 255))
    
    # Live or Upcoming badge
    if is_live:
        draw.rounded_rectangle([w - 92, 12, w - 14, 30], radius=5, fill=(239, 68, 68, 35), outline=(239, 68, 68, 140), width=1)
        draw.ellipse([w - 82, 18, w - 76, 24], fill=(239, 68, 68, 255))
        draw.text((w - 70, 14), "LIVE NOW", font=get_font(10, "bold"), fill=(248, 113, 113, 255))
    else:
        draw.text((w - 96, 14), countdown_str, font=get_font(11, "mono"), fill=(56, 189, 248, 255))
        
    # Contest Title
    t_font = get_font(14, "semibold")
    draw.text((14, 38), title, font=t_font, fill=(241, 245, 249, 255))
    
    # Time info & Duration
    time_font = get_font(11, "regular")
    draw.text((14, 62), time_str, font=time_font, fill=(148, 163, 184, 255))
    
    # Action buttons (Calendar, Reminder, Launch)
    btn_font = get_font(11, "semibold")
    bx = w - 140
    # Bell/Calendar icon button
    draw.rounded_rectangle([bx, 55, bx + 55, 77], radius=6, fill=(255, 255, 255, 12), outline=(255, 255, 255, 30), width=1)
    draw.text((bx + 10, 58), "+ Cal", font=btn_font, fill=(203, 213, 225, 255))
    
    # Join/Open button
    draw.rounded_rectangle([bx + 62, 55, bx + 126, 77], radius=6, fill=(*pcol, 210), outline=(*pcol, 255), width=1)
    draw.text((bx + 75, 58), "Open ->", font=btn_font, fill=(255, 255, 255, 255))
    
    canvas.alpha_composite(card, (x, y))

# ==============================================================================
# SCREENSHOT 1: LIVE CONTEST RADAR
# ==============================================================================
def generate_screenshot_1():
    canvas = create_base_canvas(1280, 800, (6, 182, 212), (16, 185, 129))
    draw_header_section(
        canvas,
        "REAL-TIME CONTEST RADAR",
        "Never Miss a Coding Contest Again",
        "Live tracking & millisecond countdowns for LeetCode, Codeforces, CodeChef, and AtCoder.",
        (6, 182, 212)
    )
    
    # Main Popup Window Mockup
    wx, wy, ww, wh = 80, 200, 520, 560
    draw_window_frame(canvas, wx, wy, ww, wh, "CodeRadar - Active Contests")
    
    # Draw Navigation Bar inside Window
    ndraw = ImageDraw.Draw(canvas)
    # Search & filters bar
    ndraw.rounded_rectangle([wx + 16, wy + 54, wx + ww - 16, wy + 88], radius=8, fill=(18, 24, 38, 255), outline=(255, 255, 255, 20), width=1)
    ndraw.text((wx + 30, wy + 62), "Search contest name or platform...", font=get_font(12, "regular"), fill=(100, 116, 139, 255))
    
    # Platform Filter Chips
    chips = [("ALL", True, (6, 182, 212)), ("LEETCODE", False, (245, 158, 11)), ("CODEFORCES", False, (59, 130, 246)), ("CODECHEF", False, (168, 85, 247))]
    cx = wx + 16
    for ctitle, active, color in chips:
        cfont = get_font(10, "bold")
        cw = len(ctitle) * 7 + 16
        if active:
            ndraw.rounded_rectangle([cx, wy + 98, cx + cw, wy + 122], radius=12, fill=(*color, 255))
            ndraw.text((cx + 8, wy + 104), ctitle, font=cfont, fill=(10, 15, 26, 255))
        else:
            ndraw.rounded_rectangle([cx, wy + 98, cx + cw, wy + 122], radius=12, fill=(255, 255, 255, 10), outline=(255, 255, 255, 24), width=1)
            ndraw.text((cx + 8, wy + 104), ctitle, font=cfont, fill=(148, 163, 184, 255))
        cx += cw + 8
        
    # Contest Cards inside Window
    cy = wy + 134
    draw_contest_card_mockup(canvas, wx + 16, cy, ww - 32, 86, "LeetCode", "Weekly Contest 435", "Today, 08:00 AM - 09:30 AM (1.5 hrs)", "01:14:22", is_live=True)
    draw_contest_card_mockup(canvas, wx + 16, cy + 96, ww - 32, 86, "Codeforces", "Codeforces Round 1002 (Div. 2)", "Tomorrow, 08:05 PM - 10:05 PM (2.0 hrs)", "in 14h 20m", is_live=False)
    draw_contest_card_mockup(canvas, wx + 16, cy + 192, ww - 32, 86, "CodeChef", "Starters 172 (Div. 1, 2, 3, 4)", "Wednesday, 08:00 PM - 10:00 PM (2.0 hrs)", "in 3d 02h", is_live=False)
    draw_contest_card_mockup(canvas, wx + 16, cy + 288, ww - 32, 86, "AtCoder", "AtCoder Beginner Contest 391", "Saturday, 05:30 PM - 07:10 PM (1.6 hrs)", "in 5d 21h", is_live=False)
    
    # Right Showcase Side: Feature Callout Cards
    rx = 640
    features = [
        ("⚡ Real-Time Web Worker Radar", "Continuous background synchronization with automatic failover APIs ensures you are never caught unprepared."),
        ("🌐 7+ Elite Competitive Platforms", "Direct API hooks into LeetCode, Codeforces, CodeChef, AtCoder, HackerEarth, and GeeksforGeeks."),
        ("🔔 Smart Alarm & Notification Center", "Precision 5m, 15m, and 30m alerts with zero sound interruption and persistent system toasts."),
        ("⚡ 100% Client-Side & Private", "Zero tracking, zero analytics scripts, and under 5MB RAM consumption. Fast, lightweight, and open.")
    ]
    
    fy = 200
    for ftitle, fdesc in features:
        fcard = Image.new("RGBA", (560, 115), (0, 0, 0, 0))
        fdraw = ImageDraw.Draw(fcard)
        fdraw.rounded_rectangle([0, 0, 560, 115], radius=14, fill=(16, 23, 38, 220), outline=(255, 255, 255, 24), width=1)
        fdraw.rounded_rectangle([0, 0, 4, 115], radius=2, fill=(6, 182, 212, 255))
        
        fdraw.text((24, 20), ftitle, font=get_font(18, "bold"), fill=(248, 250, 252, 255))
        # Simple word wrap for desc
        fdraw.text((24, 52), fdesc[:65] + "...", font=get_font(14, "regular"), fill=(148, 163, 184, 255))
        if len(fdesc) > 65:
            fdraw.text((24, 74), fdesc[65:], font=get_font(14, "regular"), fill=(148, 163, 184, 255))
            
        canvas.alpha_composite(fcard, (rx, fy))
        fy += 132
        
    canvas.save(os.path.join(OUTPUT_DIR, "screenshot_1_radar.png"), "PNG")
    print("Screenshot 1 generated.")

# ==============================================================================
# SCREENSHOT 2: MULTI-HANDLE RATING HUD
# ==============================================================================
def generate_screenshot_2():
    canvas = create_base_canvas(1280, 800, (139, 92, 246), (59, 130, 246))
    draw_header_section(
        canvas,
        "UNIFIED PROFILE HUD",
        "Track Multi-Platform Ratings In One Drawer",
        "Monitor your LeetCode Guardian rank, Codeforces Master badge, and CodeChef stars simultaneously.",
        (168, 85, 247)
    )
    
    # Left Side: Drawer Mockup
    wx, wy, ww, wh = 80, 200, 500, 560
    draw_window_frame(canvas, wx, wy, ww, wh, "CodeRadar - Developer HUD")
    
    wdraw = ImageDraw.Draw(canvas)
    
    # User Profile Header
    wdraw.rounded_rectangle([wx + 16, wy + 54, wx + ww - 16, wy + 130], radius=12, fill=(24, 33, 53, 240), outline=(255, 255, 255, 26), width=1)
    # Avatar Circle
    wdraw.ellipse([wx + 32, wy + 66, wx + 84, wy + 118], fill=(59, 130, 246, 255), outline=(255, 255, 255, 80), width=2)
    wdraw.text((wx + 46, wy + 76), "CR", font=get_font(20, "bold"), fill=(255, 255, 255, 255))
    
    # Username and active tag
    wdraw.text((wx + 98, wy + 70), "alex_coder", font=get_font(18, "bold"), fill=(248, 250, 252, 255))
    wdraw.text((wx + 98, wy + 96), "Competitive Programmer • Active", font=get_font(12, "regular"), fill=(148, 163, 184, 255))
    
    # Rating Cards in Drawer
    platforms_hud = [
        ("LeetCode", "alex_lc", "2,145", "Guardian", "Top 1.2% Worldwide", (245, 158, 11), 84),
        ("Codeforces", "alex_cf", "1,894", "Candidate Master", "Max Rating: 1912", (59, 130, 246), 72),
        ("CodeChef", "alex_cc", "1,980", "4-Star Coder", "Global Rank #1,420", (168, 85, 247), 78),
    ]
    
    hy = wy + 144
    for pname, handle, rating, badge, subdetail, pcol, pct in platforms_hud:
        hcard = Image.new("RGBA", (ww - 32, 116), (0, 0, 0, 0))
        hdraw = ImageDraw.Draw(hcard)
        hdraw.rounded_rectangle([0, 0, ww - 32, 116], radius=10, fill=(20, 28, 45, 255), outline=(*pcol, 90), width=1)
        hdraw.rounded_rectangle([0, 0, 4, 116], radius=2, fill=(*pcol, 255))
        
        # Platform & Handle
        hdraw.text((16, 14), pname, font=get_font(15, "bold"), fill=(*pcol, 255))
        hdraw.text((16, 36), f"@{handle}", font=get_font(12, "mono"), fill=(148, 163, 184, 255))
        
        # Rating & Badge
        hdraw.text((ww - 140, 12), rating, font=get_font(20, "bold"), fill=(248, 250, 252, 255))
        hdraw.rounded_rectangle([ww - 146, 38, ww - 44, 56], radius=4, fill=(*pcol, 35), outline=(*pcol, 120), width=1)
        hdraw.text((ww - 138, 40), badge, font=get_font(10, "bold"), fill=(*pcol, 255))
        
        # Progress Bar
        hdraw.rounded_rectangle([16, 76, ww - 48, 84], radius=4, fill=(255, 255, 255, 16))
        bar_w = int((ww - 64) * (pct / 100.0))
        hdraw.rounded_rectangle([16, 76, 16 + bar_w, 84], radius=4, fill=(*pcol, 255))
        
        # Sub detail
        hdraw.text((16, 92), subdetail, font=get_font(11, "regular"), fill=(100, 116, 139, 255))
        
        canvas.alpha_composite(hcard, (wx + 16, hy))
        hy += 128
        
    # Right Showcase Side: Stats Cards & Analytics
    rx = 620
    sbox = Image.new("RGBA", (580, 560), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(sbox)
    sdraw.rounded_rectangle([0, 0, 580, 560], radius=16, fill=(15, 22, 36, 230), outline=(255, 255, 255, 24), width=1)
    
    sdraw.text((36, 32), "Real-Time Rating Sync & Auto-Detect", font=get_font(22, "bold"), fill=(248, 250, 252, 255))
    sdraw.text((36, 66), "Effortlessly manage your identity across all platforms without switching tabs.", font=get_font(14, "regular"), fill=(148, 163, 184, 255))
    
    # 4 Metric Highlights
    metrics = [
        ("1,240+", "Problems Solved", (16, 185, 129)),
        ("184", "Contests Attended", (56, 189, 248)),
        ("Top 2%", "Global Percentile", (245, 158, 11)),
        ("100%", "Accurate Live Fetch", (168, 85, 247))
    ]
    
    mx, my = 36, 116
    for i, (mval, mlbl, mcol) in enumerate(metrics):
        cur_x = mx + (i % 2) * 260
        cur_y = my + (i // 2) * 110
        sdraw.rounded_rectangle([cur_x, cur_y, cur_x + 240, cur_y + 90], radius=10, fill=(22, 31, 49, 255), outline=(*mcol, 80), width=1)
        sdraw.text((cur_x + 20, cur_y + 16), mval, font=get_font(26, "bold"), fill=(*mcol, 255))
        sdraw.text((cur_x + 20, cur_y + 54), mlbl, font=get_font(13, "semibold"), fill=(148, 163, 184, 255))
        
    # Multi-User Switcher Highlight
    sdraw.rounded_rectangle([36, 360, 544, 520], radius=12, fill=(20, 29, 46, 255), outline=(255, 255, 255, 24), width=1)
    sdraw.text((56, 382), "👥 Multi-User & Friend Tracking", font=get_font(17, "bold"), fill=(248, 250, 252, 255))
    sdraw.text((56, 414), "Add peer handles and compare ratings directly in the HUD.\nSwitch between personal, collegiate, or team profiles with a single click.", font=get_font(13, "regular"), fill=(148, 163, 184, 255))
    sdraw.rounded_rectangle([56, 468, 220, 502], radius=8, fill=(139, 92, 246, 220))
    sdraw.text((80, 477), "+ Add Friend Handle", font=get_font(12, "bold"), fill=(255, 255, 255, 255))
    
    canvas.alpha_composite(sbox, (rx, wy))
    canvas.save(os.path.join(OUTPUT_DIR, "screenshot_2_hud.png"), "PNG")
    print("Screenshot 2 generated.")

# ==============================================================================
# SCREENSHOT 3: 1-CLICK CALENDAR SYNC
# ==============================================================================
def generate_screenshot_3():
    canvas = create_base_canvas(1280, 800, (16, 185, 129), (6, 182, 212))
    draw_header_section(
        canvas,
        "SEAMLESS SCHEDULE INTEGRATION",
        "1-Click Google Calendar & Alarm Export",
        "Sync contest schedules directly to Google Calendar, Outlook, and Apple iCal with smart reminders.",
        (16, 185, 129)
    )
    
    # Left Side: Active Calendar Export Modal
    wx, wy, ww, wh = 80, 200, 520, 560
    draw_window_frame(canvas, wx, wy, ww, wh, "CodeRadar - Add to Calendar")
    
    wdraw = ImageDraw.Draw(canvas)
    
    # Target Contest Card
    wdraw.rounded_rectangle([wx + 20, wy + 56, wx + ww - 20, wy + 160], radius=12, fill=(22, 31, 50, 255), outline=(245, 158, 11, 140), width=1)
    wdraw.rounded_rectangle([wx + 20, wy + 56, wx + 25, wy + 160], radius=2, fill=(245, 158, 11, 255))
    wdraw.text((wx + 40, wy + 70), "LeetCode Weekly Contest 435", font=get_font(16, "bold"), fill=(248, 250, 252, 255))
    wdraw.text((wx + 40, wy + 98), "Sunday, 08:00 AM - 09:30 AM IST (90 Mins)", font=get_font(12, "regular"), fill=(148, 163, 184, 255))
    wdraw.text((wx + 40, wy + 124), "Platform: leetcode.com/contest • Auto-URL included", font=get_font(11, "mono"), fill=(245, 158, 11, 230))
    
    # Calendar Provider Options
    cal_options = [
        ("Google Calendar", "Instant 1-click sync with default alerts", (66, 133, 244), "Sync to Google"),
        ("Outlook / Office 365", "Corporate and academic web calendar sync", (0, 120, 212), "Sync to Outlook"),
        ("Apple Calendar / .ICS File", "Download universal iCalendar file for iOS/macOS", (16, 185, 129), "Download .ICS"),
    ]
    
    oy = wy + 178
    for ctitle, cdesc, ccol, cbtn in cal_options:
        ocard = Image.new("RGBA", (ww - 40, 96), (0, 0, 0, 0))
        odraw = ImageDraw.Draw(ocard)
        odraw.rounded_rectangle([0, 0, ww - 40, 96], radius=10, fill=(18, 25, 41, 255), outline=(255, 255, 255, 22), width=1)
        
        odraw.ellipse([18, 20, 46, 48], fill=(*ccol, 40), outline=(*ccol, 160), width=1)
        odraw.text((28, 26), "📅", font=get_font(12, "regular"), fill=(255, 255, 255, 255))
        
        odraw.text((60, 18), ctitle, font=get_font(15, "bold"), fill=(248, 250, 252, 255))
        odraw.text((60, 40), cdesc, font=get_font(11, "regular"), fill=(148, 163, 184, 255))
        
        odraw.rounded_rectangle([60, 62, 190, 86], radius=6, fill=(*ccol, 210), outline=(*ccol, 255), width=1)
        odraw.text((74, 66), cbtn, font=get_font(11, "bold"), fill=(255, 255, 255, 255))
        
        canvas.alpha_composite(ocard, (wx + 20, oy))
        oy += 108
        
    # Notification Toast simulation
    wdraw.rounded_rectangle([wx + 20, wy + 494, wx + ww - 20, wy + 542], radius=8, fill=(16, 185, 129, 30), outline=(16, 185, 129, 140), width=1)
    wdraw.text((wx + 36, wy + 508), "✓ Reminder set: You will receive an alert 15 mins before start!", font=get_font(12, "semibold"), fill=(52, 211, 153, 255))
    
    # Right Showcase Side: Calendar Productivity Benefits
    rx = 640
    fcard = Image.new("RGBA", (560, 560), (0, 0, 0, 0))
    fdraw = ImageDraw.Draw(fcard)
    fdraw.rounded_rectangle([0, 0, 560, 560], radius=16, fill=(15, 22, 36, 230), outline=(255, 255, 255, 24), width=1)
    
    fdraw.text((36, 36), "Engineered for Serious Competitors", font=get_font(22, "bold"), fill=(248, 250, 252, 255))
    fdraw.text((36, 70), "Never forfeit rating points due to forgotten contest start times.", font=get_font(14, "regular"), fill=(148, 163, 184, 255))
    
    reasons = [
        ("⏰ Pre-Contest Warmup Alarms", "Automatic reminders trigger at 30m, 15m, and 5m mark with direct problem arena links."),
        ("🌐 Automatic Timezone Conversion", "No more calculating UTC or GMT. CodeRadar auto-translates contest times into your local clock."),
        ("📅 Cross-Device Synchronization", "Syncing with Google Calendar ensures alarms trigger across your phone, smartwatch, and desktop."),
        ("🛡️ Zero Clutter Guarantee", "Events include contest title, duration, official contest URL, and rules—clean and formatted.")
    ]
    
    ry = 130
    for rtitle, rdesc in reasons:
        fdraw.rounded_rectangle([36, ry, 524, ry + 88], radius=10, fill=(20, 29, 47, 255), outline=(255, 255, 255, 20), width=1)
        fdraw.text((54, ry + 16), rtitle, font=get_font(16, "bold"), fill=(52, 211, 153, 255))
        fdraw.text((54, ry + 46), rdesc[:64] + "...", font=get_font(13, "regular"), fill=(148, 163, 184, 255))
        if len(rdesc) > 64:
            fdraw.text((54, ry + 64), rdesc[64:], font=get_font(13, "regular"), fill=(148, 163, 184, 255))
        ry += 100
        
    canvas.alpha_composite(fcard, (rx, wy))
    canvas.save(os.path.join(OUTPUT_DIR, "screenshot_3_calendar.png"), "PNG")
    print("Screenshot 3 generated.")

# ==============================================================================
# SCREENSHOT 4: SHAREABLE DEV STATS CARD
# ==============================================================================
def generate_screenshot_4():
    canvas = create_base_canvas(1280, 800, (245, 158, 11), (239, 68, 68))
    draw_header_section(
        canvas,
        "PORTFOLIO & SOCIAL IDENTITY",
        "Generate Viral Developer Stats Cards",
        "Showcase your competitive rating badges on LinkedIn, X/Twitter, and GitHub in 1 click.",
        (245, 158, 11)
    )
    
    # Left/Center: Sleek High-Gloss Metallic Developer Card Mockup
    cx, cy, cw, ch = 80, 210, 600, 360
    
    # Card glow & shadow
    shadow = Image.new("RGBA", (cw + 50, ch + 50), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle([25, 25, cw + 25, ch + 25], radius=24, fill=(245, 158, 11, 40))
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    canvas.alpha_composite(shadow, (cx - 25, cy - 25))
    
    # Metallic Glass Card
    card = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(card)
    cdraw.rounded_rectangle([0, 0, cw, ch], radius=20, fill=(18, 25, 42, 250), outline=(245, 158, 11, 140), width=2)
    
    # Card Top Header
    cdraw.ellipse([32, 28, 88, 84], fill=(245, 158, 11, 230))
    cdraw.text((46, 42), "⚡", font=get_font(24, "bold"), fill=(255, 255, 255, 255))
    
    cdraw.text((104, 32), "ALEX CODER", font=get_font(22, "bold"), fill=(248, 250, 252, 255))
    cdraw.text((104, 62), "Full-Stack Engineer & Competitive Programmer", font=get_font(13, "regular"), fill=(148, 163, 184, 255))
    
    # Watermark Logo Top Right
    cdraw.text((cw - 150, 32), "CODERADAR", font=get_font(13, "bold"), fill=(245, 158, 11, 255))
    cdraw.text((cw - 150, 52), "VERIFIED STATS", font=get_font(10, "semibold"), fill=(148, 163, 184, 255))
    
    # Divider line
    cdraw.line([(32, 104), (cw - 32, 104)], fill=(255, 255, 255, 24), width=1)
    
    # Platform Ratings Grid
    platforms_stat = [
        ("LeetCode", "2,145", "Guardian", (245, 158, 11)),
        ("Codeforces", "1,894", "Candidate Master", (59, 130, 246)),
        ("CodeChef", "1,980", "4★ Division 1", (168, 85, 247)),
    ]
    
    px = 32
    for pname, rating, rank, pcol in platforms_stat:
        cdraw.rounded_rectangle([px, 124, px + 168, 240], radius=12, fill=(25, 35, 58, 255), outline=(*pcol, 90), width=1)
        cdraw.text((px + 16, 138), pname, font=get_font(13, "bold"), fill=(*pcol, 255))
        cdraw.text((px + 16, 164), rating, font=get_font(24, "bold"), fill=(248, 250, 252, 255))
        cdraw.rounded_rectangle([px + 16, 204, px + 152, 226], radius=6, fill=(*pcol, 35), outline=(*pcol, 120), width=1)
        cdraw.text((px + 22, 208), rank, font=get_font(10, "bold"), fill=(*pcol, 255))
        px += 184
        
    # Card Footer Details
    cdraw.text((32, 266), "TOTAL SOLVED: 1,248 PROBLEMS", font=get_font(12, "bold"), fill=(52, 211, 153, 255))
    cdraw.text((32, 290), "VERIFIED ON CODERADAR HUD • GENERATED TODAY", font=get_font(11, "mono"), fill=(100, 116, 139, 255))
    
    # Share Pill Buttons bottom right of card
    cdraw.rounded_rectangle([cw - 190, 260, cw - 32, 300], radius=8, fill=(245, 158, 11, 220))
    cdraw.text((cw - 175, 272), "Export PNG Card", font=get_font(12, "bold"), fill=(15, 23, 42, 255))
    
    canvas.alpha_composite(card, (cx, cy))
    
    # Right Side Explanations & Social Badges
    rx = 720
    scard = Image.new("RGBA", (480, 520), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(scard)
    sdraw.rounded_rectangle([0, 0, 480, 520], radius=16, fill=(15, 22, 36, 230), outline=(255, 255, 255, 24), width=1)
    
    sdraw.text((36, 36), "Instant Social Proof", font=get_font(22, "bold"), fill=(248, 250, 252, 255))
    sdraw.text((36, 68), "Level up your developer resume and social feed.", font=get_font(14, "regular"), fill=(148, 163, 184, 255))
    
    socials = [
        ("💼 LinkedIn Milestone Posts", "Share your contest achievements with hiring managers and recruiters automatically formatted."),
        ("🐦 X / Twitter Tech Community", "Post your weekend contest recap card directly to your developer followers."),
        ("🐙 GitHub README Badges", "Dynamic SVG and high-resolution PNG badges ready to embed directly into your GitHub profile.")
    ]
    
    sy = 120
    for stitle, sdesc in socials:
        sdraw.rounded_rectangle([36, sy, 444, sy + 105], radius=10, fill=(20, 29, 47, 255), outline=(255, 255, 255, 20), width=1)
        sdraw.text((52, sy + 18), stitle, font=get_font(16, "bold"), fill=(245, 158, 11, 255))
        sdraw.text((52, sy + 48), sdesc[:50] + "...", font=get_font(13, "regular"), fill=(148, 163, 184, 255))
        if len(sdesc) > 50:
            sdraw.text((52, sy + 70), sdesc[50:], font=get_font(13, "regular"), fill=(148, 163, 184, 255))
        sy += 120
        
    canvas.alpha_composite(scard, (rx, 210))
    canvas.save(os.path.join(OUTPUT_DIR, "screenshot_4_card.png"), "PNG")
    print("Screenshot 4 generated.")

# ==============================================================================
# SCREENSHOT 5: INSTANT SEARCH & ZERO LATENCY
# ==============================================================================
def generate_screenshot_5():
    canvas = create_base_canvas(1280, 800, (59, 130, 246), (139, 92, 246))
    draw_header_section(
        canvas,
        "COMMAND & FILTER SUITE",
        "Instant Search with Millisecond Response",
        "Filter by platform, duration, or live status with instant offline caching and smart memory.",
        (59, 130, 246)
    )
    
    # Left Side: Active Search & Filter Interface Mockup
    wx, wy, ww, wh = 80, 200, 520, 560
    draw_window_frame(canvas, wx, wy, ww, wh, "CodeRadar - Filter Engine")
    
    wdraw = ImageDraw.Draw(canvas)
    
    # Search Box with Active Input "Div. 2"
    wdraw.rounded_rectangle([wx + 16, wy + 54, wx + ww - 16, wy + 94], radius=8, fill=(24, 34, 54, 255), outline=(59, 130, 246, 180), width=2)
    wdraw.text((wx + 30, wy + 65), "Div. 2|", font=get_font(14, "semibold"), fill=(248, 250, 252, 255))
    wdraw.rounded_rectangle([wx + ww - 86, wy + 62, wx + ww - 26, wy + 86], radius=4, fill=(59, 130, 246, 40), outline=(59, 130, 246, 120), width=1)
    wdraw.text((wx + ww - 76, wy + 66), "3 results", font=get_font(11, "bold"), fill=(96, 165, 250, 255))
    
    # Duration Filter dropdown mockup
    wdraw.rounded_rectangle([wx + 16, wy + 104, wx + 180, wy + 134], radius=6, fill=(20, 28, 45, 255), outline=(255, 255, 255, 24), width=1)
    wdraw.text((wx + 28, wy + 112), "Duration: <= 2.5 Hrs ▾", font=get_font(11, "semibold"), fill=(148, 163, 184, 255))
    
    # Fast Platform Pills
    wdraw.rounded_rectangle([wx + 190, wy + 104, wx + 310, wy + 134], radius=6, fill=(59, 130, 246, 30), outline=(59, 130, 246, 120), width=1)
    wdraw.text((wx + 202, wy + 112), "Codeforces (Active)", font=get_font(11, "bold"), fill=(96, 165, 250, 255))
    
    # Matched Results
    results_y = wy + 150
    draw_contest_card_mockup(canvas, wx + 16, results_y, ww - 32, 86, "Codeforces", "Codeforces Round 1002 (Div. 2)", "Tomorrow, 08:05 PM (2.0 hrs)", "in 14h 20m")
    draw_contest_card_mockup(canvas, wx + 16, results_y + 96, ww - 32, 86, "Codeforces", "Educational Codeforces Round 174 (Div. 2)", "Friday, 08:05 PM (2.0 hrs)", "in 4d 04h")
    draw_contest_card_mockup(canvas, wx + 16, results_y + 192, ww - 32, 86, "Codeforces", "Codeforces Round 1003 (Div. 2)", "Sunday, 08:05 PM (2.0 hrs)", "in 6d 08h")
    
    # Offline Cache Banner inside window
    wdraw.rounded_rectangle([wx + 16, wy + 460, wx + ww - 16, wy + 520], radius=8, fill=(16, 185, 129, 20), outline=(16, 185, 129, 90), width=1)
    wdraw.text((wx + 32, wy + 472), "⚡ Zero Network Latency: Cached in Chrome Storage API", font=get_font(11, "bold"), fill=(52, 211, 153, 255))
    wdraw.text((wx + 32, wy + 494), "Contests remain visible even when you are completely offline.", font=get_font(11, "regular"), fill=(148, 163, 184, 255))
    
    # Right Side: Performance Pillars
    rx = 640
    pcard = Image.new("RGBA", (560, 560), (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(pcard)
    pdraw.rounded_rectangle([0, 0, 560, 560], radius=16, fill=(15, 22, 36, 230), outline=(255, 255, 255, 24), width=1)
    
    pdraw.text((36, 36), "Blazing Speed. Zero Bloat.", font=get_font(22, "bold"), fill=(248, 250, 252, 255))
    pdraw.text((36, 70), "Engineered with vanilla JavaScript for lightning performance.", font=get_font(14, "regular"), fill=(148, 163, 184, 255))
    
    pillars = [
        ("⚡ 12 Millisecond Startup Time", "Opens instantaneously when clicking the Chrome extension icon with zero lag or frame drops."),
        ("💾 Offline-First Architecture", "Stores the last fetched schedule in local Chrome storage so you never lose contest visibility."),
        ("🔍 Fuzzy Match Filtering", "Search by contest keywords ('Div. 3', 'Biweekly', 'Starters') with instant keystroke filtering."),
        ("🛡️ Battery & Memory Efficient", "Uses Chrome Alarms API instead of continuous polling loops to preserve your battery life.")
    ]
    
    py = 130
    for ptitle, pdesc in pillars:
        pdraw.rounded_rectangle([36, py, 524, py + 88], radius=10, fill=(20, 29, 47, 255), outline=(255, 255, 255, 20), width=1)
        pdraw.text((54, py + 16), ptitle, font=get_font(16, "bold"), fill=(96, 165, 250, 255))
        pdraw.text((54, py + 46), pdesc[:64] + "...", font=get_font(13, "regular"), fill=(148, 163, 184, 255))
        if len(pdesc) > 64:
            pdraw.text((54, py + 64), pdesc[64:], font=get_font(13, "regular"), fill=(148, 163, 184, 255))
        py += 100
        
    canvas.alpha_composite(pcard, (rx, wy))
    canvas.save(os.path.join(OUTPUT_DIR, "screenshot_5_live.png"), "PNG")
    print("Screenshot 5 generated.")

# ==============================================================================
# MARQUEE HERO BANNER: 1400x560
# ==============================================================================
def generate_marquee_banner():
    canvas = create_base_canvas(1400, 560, (6, 182, 212), (139, 92, 246))
    draw = ImageDraw.Draw(canvas)
    
    # Left Content Hero Section
    lx = 80
    
    # Badge
    badge_font = get_font(12, "bold")
    draw.rounded_rectangle([lx, 60, lx + 210, 88], radius=14, fill=(6, 182, 212, 25), outline=(6, 182, 212, 100), width=1)
    draw.ellipse([lx + 12, 70, lx + 18, 76], fill=(6, 182, 212, 255))
    draw.text((lx + 26, 68), "CHROME EXTENSION 2026", font=badge_font, fill=(6, 182, 212, 255))
    
    # Huge Main Title
    draw.text((lx, 105), "CodeRadar", font=get_font(54, "bold"), fill=(248, 250, 252, 255))
    draw.text((lx, 172), "The Ultimate Competitive Programming Radar", font=get_font(20, "semibold"), fill=(56, 189, 248, 255))
    
    # Key Bullet Points
    bullets = [
        "⚡ Real-Time Tracking for LeetCode, Codeforces, CodeChef & AtCoder",
        "🏆 Multi-Platform Rating HUD with Guardian & Master Badges",
        "📅 1-Click Google Calendar, Outlook & Smart Alarm Sync",
        "🔒 100% Private, Zero Tracking & Offline-First Performance"
    ]
    
    by = 225
    for b in bullets:
        draw.text((lx, by), b, font=get_font(14, "regular"), fill=(203, 213, 225, 255))
        by += 32
        
    # Social Proof Pill
    draw.rounded_rectangle([lx, 380, lx + 360, 425], radius=10, fill=(245, 158, 11, 20), outline=(245, 158, 11, 80), width=1)
    draw.text((lx + 16, 392), "★★★★★  Trusted by 10,000+ Competitive Programmers", font=get_font(12, "bold"), fill=(245, 158, 11, 255))
    
    # Platform Icons Row at bottom
    plat_names = ["LEETCODE", "CODEFORCES", "CODECHEF", "ATCODER", "GEEKSFORGEEKS"]
    px = lx
    for pn in plat_names:
        pcol = get_platform_color(pn)
        draw.rounded_rectangle([px, 450, px + len(pn)*7 + 16, 474], radius=4, fill=(*pcol, 30), outline=(*pcol, 90), width=1)
        draw.text((px + 8, 455), pn, font=get_font(9, "bold"), fill=(*pcol, 255))
        px += len(pn)*7 + 24
        
    # Right Side: Floating High-Gloss Extension Window
    rx, ry, rw, rh = 760, 50, 560, 460
    draw_window_frame(canvas, rx, ry, rw, rh, "CodeRadar Live Arena")
    
    # Inside window
    draw_contest_card_mockup(canvas, rx + 16, ry + 56, rw - 32, 84, "LeetCode", "Weekly Contest 435", "Today, 08:00 AM (1.5 hrs)", "01:14:22", is_live=True)
    draw_contest_card_mockup(canvas, rx + 16, ry + 150, rw - 32, 84, "Codeforces", "Codeforces Round 1002 (Div. 2)", "Tomorrow, 08:05 PM (2.0 hrs)", "in 14h 20m")
    draw_contest_card_mockup(canvas, rx + 16, ry + 244, rw - 32, 84, "CodeChef", "Starters 172 (Div. 1, 2, 3)", "Wednesday, 08:00 PM (2.0 hrs)", "in 3d 02h")
    draw_contest_card_mockup(canvas, rx + 16, ry + 338, rw - 32, 84, "AtCoder", "AtCoder Beginner Contest 391", "Saturday, 05:30 PM (1.6 hrs)", "in 5d 21h")
    
    canvas.save(os.path.join(OUTPUT_DIR, "promo_marquee_1400x560.png"), "PNG")
    print("Marquee Banner generated.")

# ==============================================================================
# SMALL PROMO TILE: 440x280
# ==============================================================================
def generate_small_tile():
    canvas = create_base_canvas(440, 280, (6, 182, 212), (139, 92, 246))
    draw = ImageDraw.Draw(canvas)
    
    # Subtle central radar ring glow
    cx, cy = 220, 95
    for r in range(75, 20, -10):
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(6, 182, 212, int(60 * (1 - r/85))), width=1)
        
    # Radar Icon Center
    draw.ellipse([cx - 36, cy - 36, cx + 36, cy + 36], fill=(13, 21, 38, 255), outline=(6, 182, 212, 220), width=2)
    # Sweeping radar wedge
    draw.pieslice([cx - 32, cy - 32, cx + 32, cy + 32], start=220, end=300, fill=(6, 182, 212, 120))
    draw.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=(56, 189, 248, 255))
    
    # Title
    t_font = get_font(28, "bold")
    draw.text((220, 165), "CodeRadar", font=t_font, fill=(248, 250, 252, 255), anchor="mm")
    
    # Tagline
    sub_font = get_font(13, "semibold")
    draw.text((220, 195), "Contest Radar & Rating HUD", font=sub_font, fill=(56, 189, 248, 255), anchor="mm")
    
    # Platform Dots Row
    dots = [
        ("LC", (245, 158, 11)),
        ("CF", (59, 130, 246)),
        ("CC", (168, 85, 247)),
        ("AC", (16, 185, 129)),
    ]
    dx = 150
    for dname, dcol in dots:
        draw.rounded_rectangle([dx, 224, dx + 30, 244], radius=4, fill=(*dcol, 35), outline=(*dcol, 140), width=1)
        draw.text((dx + 8, 228), dname, font=get_font(10, "bold"), fill=(*dcol, 255))
        dx += 38
        
    canvas.save(os.path.join(OUTPUT_DIR, "promo_small_440x280.png"), "PNG")
    print("Small Tile generated.")

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("Generating Chrome Web Store promotional assets...")
    generate_screenshot_1()
    generate_screenshot_2()
    generate_screenshot_3()
    generate_screenshot_4()
    generate_screenshot_5()
    generate_marquee_banner()
    generate_small_tile()
    print("All promotional assets created successfully!")
