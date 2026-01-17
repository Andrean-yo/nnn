"""
Main Automation Bot - Orchestrates workflow with Telegram Control
"""

import config
from youtube_engine import YouTubeEngine
from analyzer import VideoAnalyzer
from translator import Translator
from image_gen import ImageGenerator
from video_processor import VideoProcessor
from uploader import PlatformUploader
from telegram_bot import start_telegram_bot
import logging
import time
import sys
import threading

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SocialMediaBot:
    def __init__(self):
        self.youtube = YouTubeEngine()
        self.analyzer = VideoAnalyzer()
        self.translator = Translator()
        self.image_gen = ImageGenerator()
        self.video_proc = VideoProcessor()
        self.uploader = PlatformUploader()
        self.is_looping = False
        self._stop_event = threading.Event()

    def run_workflow(self, genre=None):
        genre = genre or config.DEFAULT_GENRE
        print(f"DEBUG: Starting run_workflow for genre: {genre}", flush=True)
        logger.info(f"Starting workflow for genre: {genre}")
        
        print("DEBUG: Searching videos on YouTube...", flush=True)
        videos = self.youtube.search_videos(genre)
        if not videos:
            print("DEBUG: No videos found!", flush=True)
            return False
        
        print(f"DEBUG: Found {len(videos)} videos. Selecting best...", flush=True)
        best = self.analyzer.select_best_video(videos)
        print(f"DEBUG: Best video selected: {best['video_info']['title']}. Downloading...", flush=True)
        video_path = self.youtube.download_video(best['video_info']['url'])
        if not video_path:
            print("DEBUG: Download failed!", flush=True)
            return False
        
        print("DEBUG: Translating metadata...", flush=True)
        meta = self.translator.translate_video_metadata(best)
        print("DEBUG: Generating thumbnail...", flush=True)
        thumb = self.image_gen.generate_thumbnail(best, meta)
        print("DEBUG: Processing video (cropping, subtitles)...", flush=True)
        final_video = self.video_proc.process_video_full(video_path, meta['caption'], thumb)
        
        print("DEBUG: Uploading to platform...", flush=True)
        return self.uploader.upload(config.DEFAULT_PLATFORM, final_video, meta)

    def run_loop(self):
        print("DEBUG: run_loop method started", flush=True)
        self.is_looping = True
        self._stop_event.clear()
        
        while self.is_looping and not self._stop_event.is_set():
            print("DEBUG: Entering loop iteration...", flush=True)
            logger.info("Loop iteration started...")
            try:
                success = self.run_workflow()
                print(f"DEBUG: Workflow success: {success}", flush=True)
            except Exception as e:
                print(f"DEBUG ERROR in loop: {e}", flush=True)
                logger.error(f"Error in loop iteration: {e}", exc_info=True)
            
            print(f"DEBUG: Waiting for {config.LOOP_DELAY_SECONDS} seconds...", flush=True)
            if self._stop_event.wait(timeout=config.LOOP_DELAY_SECONDS):
                break
        
        self.is_looping = False
        logger.info("Loop finished.")

    def stop_loop(self):
        self.is_looping = False
        self._stop_event.set()

def main():
    bot = SocialMediaBot()
    
    # Start Telegram Bot if enabled
    if config.ENABLE_TELEGRAM_BOT:
        start_telegram_bot(bot)
        logger.info("Telegram Bot Control Enabled. Gunakan Telegram untuk mengontrol.")
    
    # Manual start check
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--loop', action='store_true')
    parser.add_argument('--setup-login', action='store_true')
    args = parser.parse_args()

    if args.setup_login:
        bot.uploader.setup_login(config.DEFAULT_PLATFORM)
        return

    if args.loop:
        bot.run_loop()
    else:
        # Jika tidak ada loop, kita biarkan process tetap hidup jika Telegram aktif
        if config.ENABLE_TELEGRAM_BOT:
            while True: time.sleep(1)
        else:
            bot.run_workflow()

if __name__ == "__main__":
    main()
