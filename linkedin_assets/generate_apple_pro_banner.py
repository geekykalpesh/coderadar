"""
CodeRadar - Apple Keynote Level 3D Pro Banner
Rendered with 2x supersampling (2400x1350 downsampled to 1200x675)
Design philosophy: Apple Pro Display / Linear.app / Raycast minimalism
"""

import os
import math
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
            return ImageFont.truetype(FONT_BOLD, size * 2) # Supersampled 2x
        elif style == "semibold":
            return ImageFont.truetype(FONT_SB, size * 2)
        elif style == "mono":
            return ImageFont.truetype(FONT_MONO, size * 2)
        else:
            return ImageFont.truetype(FONT_REG, size * 2)
    except:
        return ImageFont.load_default()

def render_apple_pro_banner():
    # 2x Supersampled canvas
    w, h = 2400, 1350
    canvas = Image.new("RGBA", (w, h), (4, 6, 11, 255))
    
    # 1. Cinematic Atmospheric Caustics & Lighting
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    
    # Top Center Subtle Rim Light
    for r in range(800, 0, -25):
        alpha = int(14 * (1 - r / 800))
        gdraw.ellipse([1200 - r, 0 - r//2, 1200 + r, 0 + r//2], fill=(255, 255, 255, alpha))
        
    # Right-Center Vibrant Cyan/Teal Flare
    cx1, cy1 = 1750, 680
    for r in range(950, 0, -30):
        alpha = int(35 * (1 - r / 950))
        gdraw.ellipse([cx1 - r, cy1 - r, cx1 + r, cy1 + r], fill=(6, 182, 212, alpha))
        
    # Deep Ultraviolet Ambient Glow
    cx2, cy2 = 1350, 1150
    for r in range(900, 0, -30):
        alpha = int(28 * (1 - r / 900))
        gdraw.ellipse([cx2 - r, cy2 - r, cx2 + r, cy2 + r], fill=(124, 58, 237, alpha))
        
    # Left Subtle Emerald Glow
    cx3, cy3 = 400, 1100
    for r in range(700, 0, -30):
        alpha = int(18 * (1 - r / 700))
        gdraw.ellipse([cx3 - r, cy3 - r, cx3 + r, cy3 + r], fill=(16, 185, 129, alpha))
        
    canvas = Image.alpha_composite(canvas, glow)
    draw = ImageDraw.Draw(canvas)
    
    # Micro Dot Matrix Grid (Apple / Vercel style)
    for x in range(0, w, 60):
        for y in range(0, h, 60):
            draw.ellipse([x - 1, y - 1, x + 1, y + 1], fill=(255, 255, 255, 12))
            
    # =========================================================================
    # LEFT: APPLE-STYLE BOLD MINIMALIST TYPOGRAPHY
    # =========================================================================
    lx = 140
    
    # 1. Luxury Eyebrow Pill
    pill_w, pill_h = 420, 56
    draw.rounded_rectangle([lx, 140, lx + pill_w, 140 + pill_h], radius=28, fill=(255, 255, 255, 16), outline=(255, 255, 255, 45), width=2)
    # Pulsing live indicator
    draw.ellipse([lx + 24, 140 + 20, lx + 40, 140 + 36], fill=(52, 211, 153, 255))
    draw.text((lx + 52, 140 + 12), "CHROME EXTENSION 2026", font=get_font(13, "bold"), fill=(226, 232, 240, 255))
    
    # 2. Hero Headline (Apple Monolithic Typography)
    draw.text((lx, 230), "Never miss", font=get_font(60, "bold"), fill=(248, 250, 252, 255))
    draw.text((lx, 340), "a round.", font=get_font(60, "bold"), fill=(56, 189, 248, 255))
    
    # 3. Subtitle (Linear / Stripe style elegance)
    draw.text((lx, 470), "Real-time contest radar. Multi-platform rating HUD.", font=get_font(21, "semibold"), fill=(203, 213, 225, 255))
    draw.text((lx, 525), "Instant Google Calendar sync for LeetCode, Codeforces & CodeChef.", font=get_font(17, "regular"), fill=(148, 163, 184, 255))
    
    # 4. Three High-End Architectural Value Cards
    cards_data = [
        ("0ms Latency Radar", "Millisecond countdowns with zero background bloat", (6, 182, 212)),
        ("Unified Rating Identity", "Monitor Guardian, Master & 4-Star stats in 1 drawer", (168, 85, 247)),
        ("Autonomous 1-Click Alarms", "Direct calendar scheduling & 15m desktop pings", (16, 185, 129))
    ]
    
    cy = 620
    for ctitle, cdesc, ccol in cards_data:
        draw.rounded_rectangle([lx, cy, lx + 860, cy + 115], radius=20, fill=(13, 20, 36, 220), outline=(255, 255, 255, 22), width=2)
        # Vertical accent pill
        draw.rounded_rectangle([lx, cy, lx + 8, cy + 115], radius=4, fill=(*ccol, 255))
        
        draw.text((lx + 36, cy + 22), ctitle, font=get_font(18, "bold"), fill=(248, 250, 252, 255))
        draw.text((lx + 36, cy + 64), cdesc, font=get_font(14, "regular"), fill=(148, 163, 184, 255))
        cy += 140
        
    # 5. Bottom Spec Bar (Apple keynote specs strip)
    sy = 1100
    specs = [
        "⚡ 100% CLIENT-SIDE",
        "🔒 ZERO TELEMETRY",
        "🚀 MANIFEST V3",
        "★ FREE & OPEN SOURCE"
    ]
    sx = lx
    for sp in specs:
        draw.text((sx, sy), sp, font=get_font(13, "bold"), fill=(100, 116, 139, 255))
        draw.ellipse([sx + len(sp)*15 + 16, sy + 14, sx + len(sp)*15 + 24, sy + 22], fill=(255, 255, 255, 40))
        sx += len(sp) * 15 + 48
        
    # =========================================================================
    # RIGHT: TITANIUM FROSTED GLASS 3D DISPLAY DEVICE
    # =========================================================================
    dx, dy, dw, dh = 1140, 160, 1120, 1020
    
    # 3D Depth Shadows (Layered ambient occlusion)
    for off, b_rad, a_val in [(40, 60, 160), (20, 30, 120), (8, 15, 80)]:
        dshadow = Image.new("RGBA", (dw + off*2, dh + off*2), (0, 0, 0, 0))
        dsdraw = ImageDraw.Draw(dshadow)
        dsdraw.rounded_rectangle([off, off, dw + off, dh + off], radius=40, fill=(0, 0, 0, a_val))
        dshadow = dshadow.filter(ImageFilter.GaussianBlur(b_rad))
        canvas.alpha_composite(dshadow, (dx - off, dy - off + 20))
        
    # Device Body (Titanium beveled glass)
    dev = Image.new("RGBA", (dw, dh), (0, 0, 0, 0))
    ddraw = ImageDraw.Draw(dev)
    
    # Glass Chassis
    ddraw.rounded_rectangle([0, 0, dw, dh], radius=36, fill=(11, 16, 28, 250), outline=(255, 255, 255, 36), width=3)
    # Specular Inner Rim
    ddraw.rounded_rectangle([3, 3, dw - 3, dh - 3], radius=34, outline=(255, 255, 255, 18), width=1)
    
    # Top Window Bar
    ddraw.rounded_rectangle([0, 0, dw, 80], radius=36, fill=(18, 25, 42, 255))
    ddraw.rectangle([0, 40, dw, 80], fill=(18, 25, 42, 255))
    ddraw.line([(0, 80), (dw, 80)], fill=(255, 255, 255, 22), width=2)
    
    # Three Window Dots
    ddraw.ellipse([30, 28, 50, 48], fill=(239, 68, 68, 230))
    ddraw.ellipse([64, 28, 84, 48], fill=(245, 158, 11, 230))
    ddraw.ellipse([98, 28, 118, 48], fill=(16, 185, 129, 230))
    
    ddraw.text((150, 24), "CodeRadar Pro Display • Live Synchronizer", font=get_font(14, "semibold"), fill=(148, 163, 184, 255))
    
    # Live Arena Status Badge in Top Bar
    ddraw.rounded_rectangle([dw - 240, 20, dw - 30, 60], radius=18, fill=(16, 185, 129, 30), outline=(16, 185, 129, 140), width=2)
    ddraw.ellipse([dw - 218, 34, dw - 204, 48], fill=(16, 185, 129, 255))
    ddraw.text((dw - 192, 26), "RADAR ACTIVE", font=get_font(12, "bold"), fill=(52, 211, 153, 255))
    
    # Device Inside: Hero Live Arena Display
    # Big Live Contest Hero Card
    ddraw.rounded_rectangle([36, 110, dw - 36, 320], radius=24, fill=(18, 28, 50, 255), outline=(245, 158, 11, 140), width=2)
    ddraw.rounded_rectangle([36, 110, 46, 320], radius=4, fill=(245, 158, 11, 255))
    
    # Platform badge
    ddraw.rounded_rectangle([66, 136, 220, 180], radius=10, fill=(245, 158, 11, 35), outline=(245, 158, 11, 120), width=2)
    ddraw.text((82, 144), "LEETCODE", font=get_font(13, "bold"), fill=(245, 158, 11, 255))
    
    # Live Pulse Badge Right
    ddraw.rounded_rectangle([dw - 230, 136, dw - 66, 180], radius=10, fill=(239, 68, 68, 35), outline=(239, 68, 68, 140), width=2)
    ddraw.ellipse([dw - 210, 150, dw - 198, 162], fill=(239, 68, 68, 255))
    ddraw.text((dw - 186, 144), "LIVE NOW", font=get_font(13, "bold"), fill=(248, 113, 113, 255))
    
    ddraw.text((66, 204), "Weekly Contest 435", font=get_font(26, "bold"), fill=(248, 250, 252, 255))
    ddraw.text((66, 264), "Starts today • 08:00 AM - 09:30 AM IST (90 Mins) • leetcode.com/contest", font=get_font(14, "regular"), fill=(148, 163, 184, 255))
    
    # Monolithic Countdown Clock
    ddraw.rounded_rectangle([dw - 360, 214, dw - 66, 290], radius=14, fill=(10, 15, 28, 255), outline=(56, 189, 248, 90), width=2)
    ddraw.text((dw - 336, 228), "01:14:22", font=get_font(22, "mono"), fill=(56, 189, 248, 255))
    
    # Second Contest Card: Codeforces
    ddraw.rounded_rectangle([36, 345, dw - 36, 520], radius=24, fill=(16, 24, 44, 255), outline=(59, 130, 246, 120), width=2)
    ddraw.rounded_rectangle([36, 345, 46, 520], radius=4, fill=(59, 130, 246, 255))
    
    ddraw.rounded_rectangle([66, 370, 240, 412], radius=10, fill=(59, 130, 246, 35), outline=(59, 130, 246, 120), width=2)
    ddraw.text((82, 378), "CODEFORCES", font=get_font(13, "bold"), fill=(59, 130, 246, 255))
    ddraw.text((dw - 220, 376), "in 14h 20m", font=get_font(16, "mono"), fill=(56, 189, 248, 255))
    
    ddraw.text((66, 430), "Codeforces Round 1002 (Div. 2)", font=get_font(24, "bold"), fill=(248, 250, 252, 255))
    ddraw.text((66, 478), "Tomorrow • 08:05 PM - 10:05 PM (2.0 hrs) • Rated for Div. 2", font=get_font(14, "regular"), fill=(148, 163, 184, 255))
    
    # Third Contest Card: CodeChef
    ddraw.rounded_rectangle([36, 545, dw - 36, 720], radius=24, fill=(16, 24, 44, 255), outline=(168, 85, 247, 120), width=2)
    ddraw.rounded_rectangle([36, 545, 46, 720], radius=4, fill=(168, 85, 247, 255))
    
    ddraw.rounded_rectangle([66, 570, 220, 612], radius=10, fill=(168, 85, 247, 35), outline=(168, 85, 247, 120), width=2)
    ddraw.text((82, 578), "CODECHEF", font=get_font(13, "bold"), fill=(168, 85, 247, 255))
    ddraw.text((dw - 220, 576), "in 3d 02h", font=get_font(16, "mono"), fill=(56, 189, 248, 255))
    
    ddraw.text((66, 630), "Starters 172 (Div. 1, 2, 3, 4)", font=get_font(24, "bold"), fill=(248, 250, 252, 255))
    ddraw.text((66, 678), "Wednesday • 08:00 PM - 10:00 PM (2.0 hrs) • Rated for all divisions", font=get_font(14, "regular"), fill=(148, 163, 184, 255))
    
    # Bottom HUD Drawer: 3 Metallic Rating Badges
    ddraw.rounded_rectangle([36, 750, dw - 36, 980], radius=24, fill=(14, 20, 36, 255), outline=(255, 255, 255, 24), width=2)
    ddraw.text((66, 775), "⚡ MULTI-PLATFORM DEVELOPER IDENTITY", font=get_font(13, "bold"), fill=(56, 189, 248, 255))
    
    # 3 Badges side by side
    badges = [
        ("LeetCode", "2,145", "GUARDIAN", (245, 158, 11)),
        ("Codeforces", "1,894", "MASTER", (59, 130, 246)),
        ("CodeChef", "1,980", "4-STAR", (168, 85, 247))
    ]
    bx = 66
    for b_plat, b_rat, b_rank, b_col in badges:
        bw = (dw - 180) // 3
        ddraw.rounded_rectangle([bx, 815, bx + bw, 950], radius=16, fill=(20, 28, 48, 255), outline=(*b_col, 100), width=2)
        ddraw.text((bx + 20, 832), b_plat, font=get_font(12, "bold"), fill=(*b_col, 255))
        ddraw.text((bx + 20, 860), b_rat, font=get_font(24, "bold"), fill=(248, 250, 252, 255))
        ddraw.rounded_rectangle([bx + 20, 908, bx + bw - 20, 936], radius=6, fill=(*b_col, 40), outline=(*b_col, 140), width=1)
        ddraw.text((bx + 32, 912), b_rank, font=get_font(10, "bold"), fill=(*b_col, 255))
        bx += bw + 24
        
    canvas.alpha_composite(dev, (dx, dy))
    
    # =========================================================================
    # FLOATING 3D GLASS MEDAL (POPPING OUT OVER THE DISPLAY)
    # =========================================================================
    mx, my, mw, mh = 1760, 80, 440, 140
    mshadow = Image.new("RGBA", (mw + 40, mh + 40), (0, 0, 0, 0))
    msdraw = ImageDraw.Draw(mshadow)
    msdraw.rounded_rectangle([20, 20, mw + 20, mh + 20], radius=24, fill=(0, 0, 0, 180))
    mshadow = mshadow.filter(ImageFilter.GaussianBlur(18))
    canvas.alpha_composite(mshadow, (mx - 20, my - 20 + 8))
    
    medal = Image.new("RGBA", (mw, mh), (0, 0, 0, 0))
    mdraw = ImageDraw.Draw(medal)
    mdraw.rounded_rectangle([0, 0, mw, mh], radius=20, fill=(20, 30, 52, 250), outline=(16, 185, 129, 180), width=3)
    
    # Glowing bell
    mdraw.ellipse([24, 34, 76, 86], fill=(16, 185, 129, 40), outline=(16, 185, 129, 220), width=2)
    mdraw.text((36, 42), "📅", font=get_font(18, "regular"), fill=(255, 255, 255, 255))
    
    mdraw.text((94, 28), "1-Click Calendar Sync", font=get_font(16, "bold"), fill=(248, 250, 252, 255))
    mdraw.text((94, 62), "Export to Google Calendar & Outlook", font=get_font(12, "regular"), fill=(148, 163, 184, 255))
    mdraw.text((94, 92), "✓ 15m Automated System Alerts", font=get_font(12, "bold"), fill=(52, 211, 153, 255))
    
    canvas.alpha_composite(medal, (mx, my))
    
    # 2x Downsample using Lanczos for buttery smooth anti-aliased subpixels
    final_img = canvas.resize((1200, 675), Image.Resampling.LANCZOS)
    
    out_path = os.path.join(OUTPUT_DIR, "linkedin_apple_pro_1200x675.png")
    final_img.save(out_path, "PNG", quality=100)
    print("Apple Pro LinkedIn banner saved successfully at:", out_path)

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    render_apple_pro_banner()
