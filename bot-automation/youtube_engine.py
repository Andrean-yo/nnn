"""
YouTube Engine - Search and download videos
"""

import yt_dlp
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import config
from typing import List, Dict, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class YouTubeEngine:
    """Handle YouTube video search and download"""
    
    def __init__(self, api_key: str = None):
        """Initialize YouTube API client"""
        self.api_key = api_key or config.YOUTUBE_API_KEY
        if self.api_key == "YOUR_YOUTUBE_API_KEY_HERE":
            logger.warning("YouTube API key not set. Search might fail.")
        
        try:
            self.youtube = build('youtube', 'v3', developerKey=self.api_key)
        except Exception as e:
            logger.error(f"Failed to build YouTube service: {e}")
            self.youtube = None
    
    def search_videos(self, genre: str, max_results: int = 10) -> List[Dict]:
        """Search for videos by genre"""
        if not self.youtube:
            logger.error("YouTube service not initialized.")
            return []

        try:
            search_query = f"{genre} viral trending"
            request = self.youtube.search().list(
                part="snippet",
                q=search_query,
                type="video",
                maxResults=max_results,
                order="viewCount",
                videoDuration="short",
                relevanceLanguage="en"
            )
            
            response = request.execute()
            videos = []
            for item in response.get('items', []):
                video_id = item['id']['videoId']
                snippet = item['snippet']
                video_details = self._get_video_details(video_id)
                
                if video_details:
                    videos.append({
                        'video_id': video_id,
                        'title': snippet['title'],
                        'description': snippet['description'],
                        'channel': snippet['channelTitle'],
                        'published_at': snippet['publishedAt'],
                        'thumbnail': snippet['thumbnails']['high']['url'],
                        'url': f"https://www.youtube.com/watch?v={video_id}",
                        **video_details
                    })
            return videos
        except HttpError as e:
            logger.error(f"YouTube API error: {e}")
            return []
    
    def _get_video_details(self, video_id: str) -> Optional[Dict]:
        """Get detailed statistics for a video"""
        try:
            request = self.youtube.videos().list(
                part="statistics,contentDetails",
                id=video_id
            )
            response = request.execute()
            if not response.get('items'): return None
            
            item = response['items'][0]
            stats = item['statistics']
            content = item['contentDetails']
            duration = self._parse_duration(content['duration'])
            
            return {
                'views': int(stats.get('viewCount', 0)),
                'likes': int(stats.get('likeCount', 0)),
                'comments': int(stats.get('commentCount', 0)),
                'duration_seconds': duration
            }
        except Exception as e:
            logger.error(f"Error getting video details: {e}")
            return None
    
    @staticmethod
    def _parse_duration(duration_str: str) -> int:
        import re
        pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
        match = re.match(pattern, duration_str)
        if not match: return 0
        h = int(match.group(1) or 0)
        m = int(match.group(2) or 0)
        s = int(match.group(3) or 0)
        return h * 3600 + m * 60 + s
    
    def download_video(self, video_url: str, output_path: str = None) -> Optional[str]:
        """Download video using yt-dlp"""
        if output_path is None:
            output_path = str(config.VIDEOS_DIR / "%(id)s.%(ext)s")
        
        ydl_opts = {
            'format': 'best[height<=1080]',
            'outtmpl': output_path,
            'postprocessors': [{'key': 'FFmpegVideoConvertor', 'preferedformat': 'mp4'}],
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
                return ydl.prepare_filename(info)
        except Exception as e:
            logger.error(f"Error downloading video: {e}")
            return None
