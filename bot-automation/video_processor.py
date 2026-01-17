"""
Video Processor - Add subtitles and process video using MoviePy (100% GRATIS)
"""

from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip, ImageClip, concatenate_videoclips
import config
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoProcessor:
    def process_video_full(self, video_path: str, subtitle_text: str, thumbnail_path: str) -> str:
        logger.info("Processing video...")
        clip = VideoFileClip(video_path)
        
        # Crop to portrait if needed
        if clip.w / clip.h > 9/16:
            new_w = int(clip.h * 9/16)
            clip = clip.crop(x_center=clip.w/2, width=new_w)
        
        # Add subtitle (Simple version)
        txt = TextClip(subtitle_text[:100], fontsize=40, color='white', bg_color='black', size=(clip.w-40, None), method='caption').set_duration(clip.duration).set_position(('center', 'bottom'))
        
        video = CompositeVideoClip([clip, txt])
        
        # Add intro
        intro = ImageClip(thumbnail_path).set_duration(2).resize(video.size)
        final = concatenate_videoclips([intro, video])
        
        out = Path(video_path).parent / f"{Path(video_path).stem}_final.mp4"
        final.write_videofile(str(out), codec='libx264', audio_codec='aac', fps=24)
        
        clip.close()
        final.close()
        return str(out)
