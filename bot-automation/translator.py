"""
Translator - 100% GRATIS dengan googletrans!
Translate video content to Indonesian tanpa API key
"""

import config
import logging
from typing import Dict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import berdasarkan setting config
if config.USE_FREE_TRANSLATION:
    # Gunakan googletrans - 100% GRATIS, tidak perlu API key!
    try:
        from googletrans import Translator as GoogleTranslator
        logger.info("✅ Using FREE googletrans (no API key needed)")
        USE_GOOGLETRANS = True
    except Exception as e:
        logger.warning(f"googletrans import failed ({e}), falling back to Gemini")
        USE_GOOGLETRANS = False
        import google.generativeai as genai
else:
    # Gunakan Gemini API (free tier)
    import google.generativeai as genai
    USE_GOOGLETRANS = False


class Translator:
    """Translate video metadata and subtitles to Indonesian - 100% FREE!"""
    
    def __init__(self, api_key: str = None):
        """Initialize translator (googletrans or Gemini)"""
        if config.USE_FREE_TRANSLATION and USE_GOOGLETRANS:
            # Menggunakan googletrans - GRATIS total!
            self.translator = GoogleTranslator()
            self.method = "googletrans (FREE)"
            logger.info("🆓 Translator initialized with FREE googletrans")
        else:
            # Fallback ke Gemini API (free tier)
            self.api_key = api_key or config.GEMINI_API_KEY
            if self.api_key == "YOUR_GEMINI_API_KEY_HERE":
                raise ValueError("Please set your Gemini API key in config.py OR set USE_FREE_TRANSLATION=True")
            
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
            self.method = "gemini (free tier)"
            logger.info("⚡ Translator initialized with Gemini free tier")
    
    def translate_text(self, text: str, context: str = "") -> str:
        """
        Translate text to Indonesian - 100% FREE!
        
        Args:
            text: Text to translate
            context: Additional context for better translation
            
        Returns:
            Translated text in Indonesian
        """
        if not text or not text.strip():
            return ""
        
        if config.USE_FREE_TRANSLATION and USE_GOOGLETRANS:
            # Gunakan googletrans - GRATIS!
            try:
                logger.info(f"🆓 Translating with googletrans (FREE)...")
                result = self.translator.translate(text, src='en', dest='id')
                translated = result.text
                logger.info(f"✅ Translation: {translated[:100]}...")
                return translated
            except Exception as e:
                logger.error(f"Googletrans error: {e}, trying split method...")
                # Try splitting into smaller chunks
                try:
                    words = text.split()
                    chunk_size = 50
                    chunks = [' '.join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]
                    translated_chunks = []
                    for chunk in chunks:
                        result = self.translator.translate(chunk, src='en', dest='id')
                        translated_chunks.append(result.text)
                    return ' '.join(translated_chunks)
                except:
                    return text  # Return original if all fails
        else:
            # Fallback: Gemini API (free tier)
            prompt = f"""Translate the following text to Indonesian (Bahasa Indonesia).
Make it natural, engaging, and suitable for TikTok audience.
Keep hashtags and emojis if present.

{f'Context: {context}' if context else ''}

Text to translate:
{text}

Respond with ONLY the Indonesian translation, nothing else.
"""
            
            try:
                logger.info("Translating text to Indonesian with Gemini...")
                response = self.model.generate_content(prompt)
                translated = response.text.strip()
                logger.info(f"Translation: {translated[:100]}...")
                return translated
                
            except Exception as e:
                logger.error(f"Translation error: {e}")
                return text  # Return original if translation fails
    
    def translate_video_metadata(self, video_analysis: Dict) -> Dict:
        """
        Translate video title, description, and generate Indonesian hashtags - FREE!
        
        Args:
            video_analysis: Video analysis dictionary containing video_info
            
        Returns:
            Dictionary with translated metadata
        """
        video_info = video_analysis.get('video_info', {})
        
        # Use suggested Indonesian title if available from analysis
        if 'suggested_title_id' in video_analysis:
            title_id = video_analysis['suggested_title_id']
        else:
            title_id = self.translate_text(
                video_info.get('title', ''),
                context="This is a video title for TikTok"
            )
        
        # Translate description
        description_id = self.translate_text(
            video_info.get('description', '')[:500],  # Limit description length
            context="This is a video description"
        )
        
        # Generate engaging caption for TikTok
        caption = self._generate_caption(video_analysis, title_id, description_id)
        
        return {
            'title_id': title_id,
            'description_id': description_id,
            'caption': caption,
            'hashtags': video_analysis.get('hashtags', self._generate_hashtags(video_info)),
            'original_title': video_info.get('title', ''),
            'original_description': video_info.get('description', '')
        }
    
    def _generate_caption(self, video_analysis: Dict, title: str, description: str) -> str:
        """Generate engaging TikTok caption in Indonesian"""
        if config.USE_FREE_TRANSLATION and USE_GOOGLETRANS:
            # Simple approach dengan googletrans
            emojis = "🔥💯✨🎯"
            return f"{title} {emojis}"
        else:
            # Using Gemini for better captions
            prompt = f"""Create an engaging TikTok caption in Indonesian based on this video.

Video Title: {title}
Description: {description[:200]}
Virality Score: {video_analysis.get('virality_score', 'N/A')}/100

Requirements:
- Make it catchy and engaging
- Use emojis appropriately
- Keep it under 150 characters
- Make viewers want to watch

Respond with ONLY the caption, nothing else.
"""
            
            try:
                response = self.model.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                logger.error(f"Caption generation error: {e}")
                return title
    
    def _generate_hashtags(self, video_info: Dict) -> list:
        """Generate relevant hashtags"""
        # Basic hashtag generation from video info
        hashtags = ['#fyp', '#viral', '#trending']
        
        # Add genre-based hashtags (you can expand this)
        title_lower = video_info.get('title', '').lower()
        
        if 'gaming' in title_lower or 'game' in title_lower:
            hashtags.extend(['#gaming', '#games', '#gamers'])
        if 'funny' in title_lower or 'comedy' in title_lower:
            hashtags.extend(['#funny', '#comedy', '#lucu'])
        if 'tutorial' in title_lower or 'how to' in title_lower:
            hashtags.extend(['#tutorial', '#howto', '#tips'])
        
        return hashtags[:8]  # Limit to 8 hashtags
    
    def translate_subtitles(self, subtitle_text: str) -> str:
        """
        Translate subtitle/transcript text - FREE!
        
        Args:
            subtitle_text: Subtitle content
            
        Returns:
            Translated subtitles
        """
        if not subtitle_text:
            return ""
        
        # Split into chunks if too long
        max_chunk_size = 1000 if USE_GOOGLETRANS else 2000
        if len(subtitle_text) > max_chunk_size:
            chunks = [subtitle_text[i:i+max_chunk_size] 
                     for i in range(0, len(subtitle_text), max_chunk_size)]
            
            translated_chunks = []
            for i, chunk in enumerate(chunks):
                logger.info(f"Translating subtitle chunk {i+1}/{len(chunks)}...")
                translated = self.translate_text(chunk, context="Video subtitles")
                translated_chunks.append(translated)
            
            return "\n".join(translated_chunks)
        else:
            return self.translate_text(subtitle_text, context="Video subtitles")


if __name__ == "__main__":
    # Test translator
    translator = Translator()
    
    print(f"Using translation method: {translator.method}")
    print()
    
    # Test simple translation
    text = "Epic gaming moment! Watch this insane clutch!"
    translated = translator.translate_text(text)
    print(f"Original: {text}")
    print(f"Translated: {translated}")
    print()
    
    # Test metadata translation
    mock_analysis = {
        'virality_score': 85,
        'video_info': {
            'title': 'Amazing Cooking Tips You Need To Know!',
            'description': 'Learn these incredible cooking hacks that will save you time and money'
        }
    }
    
    metadata = translator.translate_video_metadata(mock_analysis)
    print(f"Title: {metadata['title_id']}")
    print(f"Caption: {metadata['caption']}")
    print(f"Hashtags: {' '.join(metadata['hashtags'])}")
