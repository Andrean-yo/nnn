"""
Uploader - Automated upload to TikTok using Playwright (100% GRATIS)
"""

from playwright.sync_api import sync_playwright
import config
import logging
import time
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TikTokUploader:
    def login(self):
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False)
            context = browser.new_context()
            page = context.new_page()
            page.goto("https://www.tiktok.com/login")
            input("Login di browser lalu tekan Enter di sini...")
            context.storage_state(path="tiktok_session.json")
            browser.close()

    def upload_video(self, video_path: str, metadata: dict) -> bool:
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=False)
                context = browser.new_context(storage_state="tiktok_session.json") if Path("tiktok_session.json").exists() else browser.new_context()
                page = context.new_page()
                page.goto("https://www.tiktok.com/upload")
                time.sleep(5)
                
                # Upload logic (simplified)
                file_input = page.locator('input[type="file"]').first
                file_input.set_input_files(video_path)
                time.sleep(10)
                
                # Add caption
                caption = f"{metadata.get('caption', '')} {' '.join(metadata.get('hashtags', []))}"
                # page.locator(...) # Add caption box locator here
                
                print("====================================")
                print("SILAHKAN POST MANUAL DI BROWSER")
                print("====================================")
                input("Tekan Enter jika sudah selesai posting...")
                browser.close()
                return True
        except Exception as e:
            logger.error(f"Upload error: {e}")
            return False

class PlatformUploader:
    def __init__(self):
        self.tiktok = TikTokUploader()
    def upload(self, platform, video_path, metadata):
        if platform == "tiktok": return self.tiktok.upload_video(video_path, metadata)
        return False
    def setup_login(self, platform):
        if platform == "tiktok": self.tiktok.login()
