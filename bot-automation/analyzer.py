"""
Video Analyzer - Analyze viral potential using Gemini AI
"""

import google.generativeai as genai
import config
from typing import Dict, List
import logging
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VideoAnalyzer:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or config.GEMINI_API_KEY
        if self.api_key != "YOUR_GEMINI_API_KEY_HERE":
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        else:
            self.model = None

    def analyze_virality(self, video_info: Dict) -> Dict:
        if not self.model or config.USE_SIMPLE_ANALYSIS:
            return self._simple_analysis(video_info)

        prompt = self._build_analysis_prompt(video_info)
        try:
            response = self.model.generate_content(prompt)
            json_text = response.text[response.text.find('{'):response.text.rfind('}')+1]
            analysis = json.loads(json_text)
            analysis['video_info'] = video_info
            return analysis
        except Exception as e:
            logger.error(f"Error analyzing video: {e}")
            return self._simple_analysis(video_info)

    def _simple_analysis(self, video_info: Dict) -> Dict:
        # Analisis gratis sederhana jika tidak ada AI
        views = video_info.get('views', 0)
        likes = video_info.get('likes', 0)
        ratio = (likes / views * 100) if views > 0 else 0
        score = min(100, int(ratio * 10)) # Contoh score sederhana
        
        return {
            'virality_score': score,
            'recommendation': 'select' if score > 50 else 'skip',
            'reasoning': f"Simple metric analysis. Like/View ratio: {ratio:.2f}%",
            'video_info': video_info,
            'hashtags': ['#fyp', '#viral', '#trending']
        }

    def _build_analysis_prompt(self, video_info: Dict) -> str:
        return f"""Analyze virality potential for TikTok:
Title: {video_info['title']}
Views: {video_info['views']}
Likes: {video_info['likes']}
Respond ONLY in JSON format:
{{
    "virality_score": 0-100,
    "recommendation": "select/skip",
    "reasoning": "text",
    "suggested_title_id": "Indonesian title",
    "hashtags": ["#tag1", "#tag2"]
}}"""

    def select_best_video(self, videos: List[Dict]) -> Dict:
        if not videos: raise ValueError("No videos to analyze")
        analyzed = []
        for v in videos:
            if v['duration_seconds'] <= config.MAX_VIDEO_DURATION:
                analyzed.append(self.analyze_virality(v))
        
        if not analyzed: raise ValueError("No suitable videos")
        analyzed.sort(key=lambda x: x['virality_score'], reverse=True)
        return analyzed[0]
