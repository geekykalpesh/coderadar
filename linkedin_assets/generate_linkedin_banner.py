"""
CodeRadar - LinkedIn 3D Modern Premium Launch Banner Generator
Dimensions: 1200 x 675 px (16:9 High-DPI LinkedIn Post Banner)
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE_DIR = "c:/Users/sunit/Desktop/cp-calender"
OUTPUT_DIR = os.path.join(BASE_DIR, "linkedin_assets")

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

def generate_banner():
    width, height = 1200, 675
    canvas = Image.new("RGBA", (width, height), (7, 10, 18, 255))
    
    # 1. Atmospheric 3D Glow Backlights
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    
    # Cyan Glow on Right behind floating window
    cx1, cy1 = 880, 280
    for r in range(460, 0, -20):
        alpha = int(32 * (1 - r / 460))
        gdraw.ellipse([cx1 - r, cy1 - r, cx1 + r, cy1 + r], fill=(6, 182, 212, alpha))
        
    # Violet / Indigo Glow Bottom Center
    cx2, cy2 = 600, 580
    for r in range(420, 0, -20):
        alpha = int(24 * (1 - r / 420))
        gdraw.ellipse([cx2 - r, cy2 - r, cx2 + r, cy2 + r], fill=(139, 92, 246, alpha))
        
    # Emerald Glow Top Left
    cx3, cy3 = 180, 100
    for r in range(320, 0, -20):
        alpha = int(18 * (1 - r / 320))
        gdraw.ellipse([cx3 - r, cy3 - r, cx3 + r, cy3 + r], fill=(16, 185, 129, alpha))
        
    canvas = Image.alpha_composite(canvas, glow)
    draw = ImageDraw.Draw(canvas)
    
    # Subtle Cyber Grid Overlay
    for x in range(0, width, 50):
        draw.line([(x, 0), (x, height)], fill=(255, 255, 255, 7), width=1)
    for y in range(0, height, 50):
        draw.line([(0, y), (width, y)], fill=(255, 255, 255, 7), width=1)
        
    # =========================================================================
    # LEFT CONTENT HERO SECTION
    # =========================================================================
    lx = 64
    
    # 1. Live on Chrome Store Pill Badge
    tag_font = get_font(12, "bold")
    draw.rounded_rectangle([lx, 48, lx + 300, 78], radius=15, fill=(16, 185, 129, 28), outline=(16, 185, 129, 120), width=1)
    draw.ellipse([lx + 12, 58, lx + 20, 66], fill=(16, 185, 129, 255))
    draw.text((lx + 28, 54), "OFFICIALLY LIVE ON CHROME WEB STORE", font=tag_font, fill=(52, 211, 153, 255))
    
    # 2. Main Title & Branding
    draw.text((lx, 94), "CodeRadar ⚡", font=get_font(46, "bold"), fill=(248, 250, 252, 255))
    draw.text((lx, 150), "The Competitive Programming Radar & Rating HUD", font=get_font(18, "semibold"), fill=(56, 189, 248, 255))
    draw.text((lx, 178), "Engineered for software engineers, interview preppers & CP athletes.", font=get_font(14, "regular"), fill=(148, 163, 184, 255))
    
    # 3. Key Feature Bullets with 3D Pills
    bullets = [
        ("⚡ Real-Time Contest Radar", "Live countdowns for LeetCode, Codeforces, CodeChef & AtCoder", (6, 182, 212)),
        ("🏆 Multi-Platform Rating HUD", "Track Guardian rank, Master badges & peak ratings in one drawer", (168, 85, 247)),
        ("📅 1-Click Calendar Sync", "Auto-export rounds to Google Calendar, Outlook & 15m system alarms", (16, 185, 129)),
        ("🔒 100% Client-Side & Private", "Zero telemetry, zero tracking cookies, and sub-15ms launch speed", (245, 158, 11))
    ]
    
    by = 224
    for btitle, bdesc, bcol in bullets:
        bcard = Image.new("RGBA", (490, 60), (0, 0, 0, 0))
        bdraw = ImageDraw.Draw(bcard)
        bdraw.rounded_rectangle([0, 0, 490, 60], radius=8, fill=(18, 26, 42, 210), outline=(255, 255, 255, 20), width=1)
        bdraw.rounded_rectangle([0, 0, 4, 60], radius=2, fill=(*bcol, 255))
        
        bdraw.text((16, 8), btitle, font=get_font(14, "bold"), fill=(248, 250, 252, 255))
        bdraw.text((16, 30), bdesc, font=get_font(12, "regular"), fill=(148, 163, 184, 255))
        
        canvas.alpha_composite(bcard, (lx, by))
        by += 68
        
    # 4. Bottom Trust & Platform Badges
    platforms = [("Codeforces", (59, 130, 246)), ("LeetCode", (245, 158, 11)), ("CodeChef", (168, 85, 247)), ("AtCoder", (16, 185, 129))]
    px = lx
    for pname, pcol in platforms:
        pw = len(pname) * 8 + 20
        draw.rounded_rectangle([px, 524, px + pw, 552], radius=6, fill=(*pcol, 32), outline=(*pcol, 110), width=1)
        draw.text((px + 10, 530), pname, font=get_font(11, "bold"), fill=(*pcol, 255))
        px += pw + 10
        
    # Free & Open Source Badge
    draw.rounded_rectangle([lx, 574, lx + 360, 616], radius=10, fill=(6, 182, 212, 24), outline=(6, 182, 212, 120), width=1)
    draw.text((lx + 16, 586), "★ Free on Chrome Web Store • Open Source on GitHub", font=get_font(12, "bold"), fill=(56, 189, 248, 255))
    
    # =========================================================================
    # RIGHT SIDE: FLOATING 3D GLASSMORPHIC EXTENSION WINDOW
    # =========================================================================
    wx, wy, ww, wh = 600, 70, 536, 520
    
    # 3D Multi-Layer Drop Shadow
    for s_offset, s_blur, s_alpha in [(12, 24, 180), (6, 12, 120)]:
        shadow = Image.new("RGBA", (ww + s_offset*2, wh + s_offset*2), (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(shadow)
        sdraw.rounded_rectangle([s_offset, s_offset, ww + s_offset, wh + s_offset], radius=18, fill=(0, 0, 0, s_alpha))
        shadow = shadow.filter(ImageFilter.GaussianBlur(s_blur))
        canvas.alpha_composite(shadow, (wx - s_offset, wy - s_offset + 10))
        
    # Window Frame
    win = Image.new("RGBA", (ww, wh), (0, 0, 0, 0))
    wdraw = ImageDraw.Draw(win)
    wdraw.rounded_rectangle([0, 0, ww, wh], radius=16, fill=(13, 20, 34, 250), outline=(255, 255, 255, 32), width=1)
    
    # Titlebar
    wdraw.rounded_rectangle([0, 0, ww, 42], radius=16, fill=(20, 28, 46, 255))
    wdraw.rectangle([0, 26, ww, 42], fill=(20, 28, 46, 255))
    wdraw.line([(0, 42), (ww, 42)], fill=(255, 255, 255, 18), width=1)
    
    wdraw.ellipse([14, 14, 24, 24], fill=(239, 68, 68, 230))
    wdraw.ellipse([30, 14, 40, 24], fill=(245, 158, 11, 230))
    wdraw.ellipse([46, 14, 56, 24], fill=(16, 185, 129, 230))
    wdraw.text((70, 13), "CodeRadar v1.0.0 - Live Contest Arena", font=get_font(12, "semibold"), fill=(148, 163, 184, 255))
    
    # Search Box Mockup inside
    wdraw.rounded_rectangle([16, 52, ww - 16, 84], radius=6, fill=(18, 26, 44, 255), outline=(255, 255, 255, 20), width=1)
    wdraw.text((28, 59), "🔍 Filter by contest name, division (Div. 2), or platform...", font=get_font(11, "regular"), fill=(100, 116, 139, 255))
    
    # Contest Cards inside Window
    contests = [
        ("LeetCode", "Weekly Contest 435", "Today, 08:00 AM - 09:30 AM (90 Mins)", "01:14:22", True, (245, 158, 11)),
        ("Codeforces", "Codeforces Round 1002 (Div. 2)", "Tomorrow, 08:05 PM - 10:05 PM (2.0 hrs)", "in 14h 20m", False, (59, 130, 246)),
        ("CodeChef", "Starters 172 (Div. 1, 2, 3, 4)", "Wednesday, 08:00 PM - 10:00 PM (2.0 hrs)", "in 3d 02h", False, (168, 85, 247)),
        ("AtCoder", "AtCoder Beginner Contest 391", "Saturday, 05:30 PM - 07:10 PM (100 Mins)", "in 5d 21h", False, (16, 185, 129)),
    ]
    
    cy = 94
    for cp_name, cp_title, cp_time, cp_count, is_live, cp_col in contests:
        card_w = ww - 32
        wdraw.rounded_rectangle([16, cy, 16 + card_w, cy + 78], radius=8, fill=(21, 31, 52, 255), outline=(*cp_col, 120) if is_live else (255, 255, 255, 18), width=1)
        wdraw.rounded_rectangle([16, cy, 20, cy + 78], radius=2, fill=(*cp_col, 255))
        
        # Platform pill
        wdraw.rounded_rectangle([28, cy + 10, 28 + len(cp_name)*7 + 14, cy + 28], radius=4, fill=(*cp_col, 35), outline=(*cp_col, 100), width=1)
        wdraw.text((34, cy + 12), cp_name.upper(), font=get_font(10, "bold"), fill=(*cp_col, 255))
        
        if is_live:
            wdraw.rounded_rectangle([card_w - 76, cy + 10, card_w + 10, cy + 28], radius=4, fill=(239, 68, 68, 35), outline=(239, 68, 68, 140), width=1)
            wdraw.text((card_w - 66, cy + 12), "LIVE NOW", font=get_font(9, "bold"), fill=(248, 113, 113, 255))
        else:
            wdraw.text((card_w - 72, cy + 12), cp_count, font=get_font(11, "mono"), fill=(56, 189, 248, 255))
            
        wdraw.text((28, cy + 34), cp_title, font=get_font(13, "bold"), fill=(248, 250, 252, 255))
        wdraw.text((28, cy + 56), cp_time, font=get_font(10, "regular"), fill=(148, 163, 184, 255))
        
        # Calendar & Action button
        wdraw.rounded_rectangle([card_w - 110, cy + 46, card_w - 60, cy + 70], radius=5, fill=(255, 255, 255, 14), outline=(255, 255, 255, 26), width=1)
        wdraw.text((card_w - 98, cy + 50), "+ Cal", font=get_font(10, "bold"), fill=(203, 213, 225, 255))
        
        wdraw.rounded_rectangle([card_w - 52, cy + 46, card_w + 10, cy + 70], radius=5, fill=(*cp_col, 220), outline=(*cp_col, 255), width=1)
        wdraw.text((card_w - 40, cy + 50), "Open ➜", font=get_font(10, "bold"), fill=(255, 255, 255, 255))
        
        cy += 86
        
    canvas.alpha_composite(win, (wx, wy))
    
    # =========================================================================
    # FLOATING 3D GLASS OVERLAYS (POP OUT IN FRONT OF WINDOW)
    # =========================================================================
    # 1. Floating Alarm Reminder Toast (Top Right)
    tx, ty, tw, th = 780, 480, 380, 80
    tshadow = Image.new("RGBA", (tw + 24, th + 24), (0, 0, 0, 0))
    tsdraw = ImageDraw.Draw(tshadow)
    tsdraw.rounded_rectangle([12, 12, tw + 12, th + 12], radius=14, fill=(0, 0, 0, 160))
    tshadow = tshadow.filter(ImageFilter.GaussianBlur(10))
    canvas.alpha_composite(tshadow, (tx - 12, ty - 12 + 6))
    
    toast = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    tdraw = ImageDraw.Draw(toast)
    tdraw.rounded_rectangle([0, 0, tw, th], radius=12, fill=(19, 29, 48, 250), outline=(16, 185, 129, 160), width=2)
    
    tdraw.ellipse([16, 20, 44, 48], fill=(16, 185, 129, 40), outline=(16, 185, 129, 200), width=1)
    tdraw.text((23, 24), "🔔", font=get_font(14, "regular"), fill=(255, 255, 255, 255))
    
    tdraw.text((54, 16), "Codeforces Round 1002 starts in 15m!", font=get_font(13, "bold"), fill=(248, 250, 252, 255))
    tdraw.text((54, 38), "Automated alarm synced to your local desktop", font=get_font(11, "regular"), fill=(148, 163, 184, 255))
    tdraw.text((54, 55), "1-Click Launch • Problem arena ready", font=get_font(10, "mono"), fill=(52, 211, 153, 255))
    
    canvas.alpha_composite(toast, (tx, ty))
    
    # 2. Floating Rating Pill (Top Left Overlap)
    rx, ry, rw, rh = 540, 130, 220, 60
    rshadow = Image.new("RGBA", (rw + 20, rh + 20), (0, 0, 0, 0))
    rsdraw = ImageDraw.Draw(rshadow)
    rsdraw.rounded_rectangle([10, 10, rw + 10, rh + 10], radius=12, fill=(0, 0, 0, 140))
    rshadow = rshadow.filter(ImageFilter.GaussianBlur(8))
    canvas.alpha_composite(rshadow, (rx - 10, ry - 10 + 4))
    
    rpill = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    rpdraw = ImageDraw.Draw(rpill)
    rpdraw.rounded_rectangle([0, 0, rw, rh], radius=10, fill=(24, 34, 56, 250), outline=(59, 130, 246, 180), width=2)
    rpdraw.text((14, 10), "Codeforces Rating", font=get_font(10, "bold"), fill=(148, 163, 184, 255))
    rpdraw.text((14, 26), "1,894", font=get_font(18, "bold"), fill=(248, 250, 252, 255))
    rpdraw.rounded_rectangle([95, 26, 205, 48], radius=4, fill=(59, 130, 246, 40), outline=(59, 130, 246, 120), width=1)
    rpdraw.text((105, 30), "Candidate Master", font=get_font(9, "bold"), fill=(96, 165, 250, 255))
    
    canvas.alpha_composite(rpill, (rx, ry))
    
    canvas.save(os.path.join(OUTPUT_DIR, "linkedin_banner_3d.png"), "PNG")
    print("LinkedIn 3D banner created successfully at:", os.path.join(OUTPUT_DIR, "linkedin_banner_3d.png"))

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    generate_banner()
