"""
Image Generator - Create thumbnails using PIL (100% GRATIS)
"""

from PIL import Image, ImageDraw, ImageFont
from typing import Dict
import config
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImageGenerator:
    def generate_thumbnail(self, video_analysis: Dict, translated_metadata: Dict) -> str:
        video_info = video_analysis.get('video_info', {})
        width, height = 1080, 1920
        image = Image.new('RGB', (width, height))
        draw = ImageDraw.Draw(image)
        
        # Gradient background
        for y in range(height):
            r = int(config.THUMBNAIL_GRADIENT_START[0] + (config.THUMBNAIL_GRADIENT_END[0] - config.THUMBNAIL_GRADIENT_START[0]) * y / height)
            g = int(config.THUMBNAIL_GRADIENT_START[1] + (config.THUMBNAIL_GRADIENT_END[1] - config.THUMBNAIL_GRADIENT_START[1]) * y / height)
            b = int(config.THUMBNAIL_GRADIENT_START[2] + (config.THUMBNAIL_GRADIENT_END[2] - config.THUMBNAIL_GRADIENT_START[2]) * y / height)
            draw.line([(0, y), (width, y)], fill=(r, g, b))
        
        title = translated_metadata.get('title_id', video_info.get('title', ''))
        
        # Simple text wrapping and drawing
        # Note: In a real system you'd want specialized fonts, but we use defaults for compatibility
        draw.text((100, 800), title[:50], fill=config.THUMBNAIL_TEXT_COLOR)
        
        # Badge
        draw.rectangle([400, 1600, 680, 1700], fill=config.THUMBNAIL_BADGE_COLOR)
        draw.text((450, 1630), "🔥 VIRAL", fill="white")
        
        video_id = video_info.get('video_id', 'unknown')
        path = config.THUMBNAILS_DIR / f"{video_id}_thumb.png"
        image.save(path)
        return str(path)
