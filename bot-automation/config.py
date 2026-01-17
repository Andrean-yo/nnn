"""
Configuration file for Social Media Automation Bot - 100% GRATIS!
Fill in your API keys and preferences here
"""

import os
from pathlib import Path

# ==================== API KEYS (100% GRATIS!) ====================
# YouTube Data API v3 - GRATIS dengan quota 10,000 units/day (~100 pencarian)
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "AIzaSyCAgN9YcX1pfK0JODce7X7fVWRsImul3ts")

# Google Gemini API - GRATIS tier: 60 requests/menit
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "397189461586-4ajodt7284u4hu6bponi35ei7lk635m8.apps.googleusercontent.com")

# Telegram Bot Token - GRATIS dari @BotFather
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8395165194:AAFi_yu8GErQZZrBzNATjmJELCtWg64lWrM")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "") # Chat ID anda untuk menerima notifikasi

# ==================== FREE ALTERNATIVES ====================
USE_FREE_TRANSLATION = True  # True = pakai googletrans (no API needed)
USE_SIMPLE_ANALYSIS = False   # True = analisis sederhana tanpa AI
USE_WEB_SCRAPING = False      # True = scrape YouTube tanpa API (jika quota habis)
ENABLE_TELEGRAM_BOT = True    # Set ke True untuk mengontrol bot lewat Telegram

# ==================== GENRE PREFERENCES ====================
# Available genres for YouTube search
AVAILABLE_GENRES = [
    "gaming",
    "comedy",
    "tech",
    "lifestyle",
    "education",
    "music",
    "sports",
    "cooking",
    "travel",
    "finance"
]

# Default genre (can be overridden by user input)
DEFAULT_GENRE = "gaming"

# ==================== VIDEO SETTINGS ====================
# Maximum video duration in seconds (for shorts/TikTok)
MAX_VIDEO_DURATION = 60  # 60 seconds for TikTok/Shorts

# Minimum views to consider a video "viral"
MIN_VIRAL_VIEWS = 100000

# Number of videos to analyze before selecting one
VIDEOS_TO_ANALYZE = 10

# ==================== PATHS ====================
BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "output"
TEMP_DIR = BASE_DIR / "temp"
THUMBNAILS_DIR = OUTPUT_DIR / "thumbnails"
VIDEOS_DIR = OUTPUT_DIR / "videos"

# Create directories if they don't exist
for directory in [OUTPUT_DIR, TEMP_DIR, THUMBNAILS_DIR, VIDEOS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# ==================== UPLOAD PLATFORMS ====================
UPLOAD_PLATFORMS = {
    "tiktok": {
        "enabled": True,
        "login_required": True
    },
    "youtube_shorts": {
        "enabled": False,
        "login_required": True
    },
    "instagram_reels": {
        "enabled": False,
        "login_required": True
    }
}

# Default platform
DEFAULT_PLATFORM = "tiktok"

# ==================== AUTOMATION SETTINGS ====================
# Loop delay in seconds between each video cycle
LOOP_DELAY_SECONDS = 3600  # 1 hour

# Maximum loops (set to -1 for infinite)
MAX_LOOPS = -1

# ==================== TRANSLATION SETTINGS ====================
TARGET_LANGUAGE = "id"  # Indonesian
SOURCE_LANGUAGE = "en"  # English (auto-detect if None)

# ==================== IMAGE GENERATION (100% GRATIS!) ====================
# GRATIS: Menggunakan PIL/Pillow untuk generate thumbnail lokal
# Tidak memerlukan API atau service berbayar!

THUMBNAIL_PROMPT_TEMPLATE = "Create an eye-catching, vibrant thumbnail for a {genre} video about: {title}. Make it colorful, engaging, and suitable for TikTok/YouTube Shorts."

# Thumbnail style settings (PIL-based, completely free)
THUMBNAIL_GRADIENT_START = (138, 43, 226)  # Blue-purple
THUMBNAIL_GRADIENT_END = (148, 0, 211)     # Purple
THUMBNAIL_TEXT_COLOR = (255, 255, 255)     # White
THUMBNAIL_BADGE_COLOR = (255, 0, 0)        # Red "VIRAL" badge
