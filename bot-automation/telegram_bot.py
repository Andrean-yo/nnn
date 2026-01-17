"""
Telegram Bot Control - Mengontrol bot via menu di Telegram (100% GRATIS)
Compatible with python-telegram-bot v20+
"""

import logging
import config
import threading
import sys
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

logger = logging.getLogger(__name__)

class TelegramBot:
    def __init__(self, bot_token, automation_bot):
        self.bot_token = bot_token
        self.automation_bot = automation_bot
        self.app = None

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Kirim pesan selamat datang dan tampilkan menu keyboard"""
        reply_keyboard = [
            [KeyboardButton("🚀 Start Automation"), KeyboardButton("🛑 Stop Automation")],
            [KeyboardButton("📊 Check Status"), KeyboardButton("⏰ Upload Now")],
            [KeyboardButton("⚙️ Settings"), KeyboardButton("❓ Help")]
        ]
        markup = ReplyKeyboardMarkup(reply_keyboard, resize_keyboard=True)
        
        user_id = update.effective_user.id
        chat_id = update.effective_chat.id
        logger.info(f"✅ User {user_id} started the bot. Chat ID: {chat_id}")
        
        await update.message.reply_text(
            f"🤖 *Social Media Automation Bot*\n\n"
            f"Selamat datang! Gunakan menu di bawah untuk mengontrol bot.\n"
            f"ID Chat Anda: `{chat_id}`\n"
            f"Masukkan ID ini ke `config.py` jika perlu.",
            parse_mode='Markdown',
            reply_markup=markup
        )

    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle input dari tombol menu"""
        text = update.message.text
        logger.info(f"Received message: {text}")
        
        if text == "🚀 Start Automation":
            if not self.automation_bot.is_looping:
                threading.Thread(target=self.automation_bot.run_loop, daemon=True).start()
                await update.message.reply_text("✅ *Automation Dimulai!* Bot akan segera mencari video.", parse_mode='Markdown')
            else:
                await update.message.reply_text("⚠️ *Bot sudah berjalan!*", parse_mode='Markdown')

        elif text == "🛑 Stop Automation":
            self.automation_bot.stop_loop()
            await update.message.reply_text("🛑 *Automation Dihentikan.*", parse_mode='Markdown')

        elif text == "📊 Check Status":
            status = "🏃 Berjalan" if self.automation_bot.is_looping else "💤 Berhenti"
            delay = config.LOOP_DELAY_SECONDS / 60
            await update.message.reply_text(
                f"📊 *Status Bot:*\n\n"
                f"Kondisi: {status}\n"
                f"Genre: {config.DEFAULT_GENRE}\n"
                f"Delay: {delay:.0f} menit\n"
                f"Platform: {config.DEFAULT_PLATFORM}",
                parse_mode='Markdown'
            )

        elif text == "⏰ Upload Now":
            await update.message.reply_text("🔄 *Memproses Upload Sekarang...* (Harap tunggu)", parse_mode='Markdown')
            threading.Thread(target=self.automation_bot.run_workflow, daemon=True).start()

        elif text == "⚙️ Settings":
            await update.message.reply_text(
                "⚙️ *Pengaturan saat ini:*\n"
                f"• Delay: {config.LOOP_DELAY_SECONDS} detik\n"
                "• Gunakan `/set_delay <angka>` untuk merubah.",
                parse_mode='Markdown'
            )

        elif text == "❓ Help":
            await update.message.reply_text(
                "❓ *Bantuan:*\n\n"
                "• Gunakan tombol menu untuk kontrol cepat.\n"
                "• `/set_delay <detik>` - Atur jarak waktu antar upload.",
                parse_mode='Markdown'
            )
        else:
            await update.message.reply_text("⚠️ Perintah tidak dikenal. Gunakan menu tombol.")

    async def set_delay(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        try:
            if not context.args:
                 await update.message.reply_text("❌ Gunakan format: `/set_delay 3600`")
                 return
            new_delay = int(context.args[0])
            config.LOOP_DELAY_SECONDS = new_delay
            await update.message.reply_text(f"✅ Delay diatur ke {new_delay} detik.")
        except (IndexError, ValueError):
            await update.message.reply_text("❌ Format salah. Gunakan: `/set_delay 3600`")

    def run(self):
        """Menjalankan bot Telegram"""
        print("TELEGRAM: Initializing...", flush=True)
        try:
            self.app = ApplicationBuilder().token(self.bot_token).build()
            
            # Add handlers
            self.app.add_handler(CommandHandler("start", self.start))
            self.app.add_handler(CommandHandler("set_delay", self.set_delay))
            self.app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), self.handle_message))
            
            print("TELEGRAM: Starting polling...", flush=True)
            logger.info("🤖 Starting Telegram Bot...")
            self.app.run_polling(allowed_updates=Update.ALL_TYPES)
            print("TELEGRAM: Polling stopped.", flush=True)
        except Exception as e:
            print(f"TELEGRAM ERROR: {e}", flush=True)
            logger.error(f"Telegram Bot Crash: {e}", exc_info=True)

def start_telegram_bot(automation_bot):
    if config.TELEGRAM_BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN_HERE" or not config.ENABLE_TELEGRAM_BOT:
        return
    
    bot = TelegramBot(config.TELEGRAM_BOT_TOKEN, automation_bot)
    threading.Thread(target=bot.run, daemon=True).start()
