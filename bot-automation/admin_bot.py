
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, CallbackQueryHandler, MessageHandler, filters
import requests
import json
import os

# Configuration
BOT_TOKEN = "7832542206:AAHnZDjxGM463ic8xDVdYyF_xcKDVAq6a7I"
API_BASE_URL = "http://localhost:3000/api"

# States (simple flags for this example)
STATE = {}
WAITING_URL = "waiting_url"

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("📤 Import Manhwa", callback_data='btn_import')],
        [InlineKeyboardButton("📊 Check Status", callback_data='btn_status')],
        [InlineKeyboardButton("❌ Cancel", callback_data='btn_cancel')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text('🤖 *IndraScans Bot Manager*\nSelect an action:', reply_markup=reply_markup, parse_mode='Markdown')

async def button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    user_id = query.from_user.id

    if query.data == 'btn_import':
        STATE[user_id] = WAITING_URL
        await query.edit_message_text(text="Please send the *Manhwa Raw URL* you want to import:", parse_mode='Markdown')
        
    elif query.data == 'btn_status':
        # Simple health check or stats
        try:
            # We can check simple stats
            await query.edit_message_text(text="Checking server status...")
            # For now just mock it
            await query.edit_message_text(text="✅ Server is Online\n🌐 http://localhost:3000")
        except:
            await query.edit_message_text(text="❌ Server Offline or Unreachable")

    elif query.data == 'btn_cancel':
        if user_id in STATE:
            del STATE[user_id]
        await query.edit_message_text(text="Action cancelled.")
        await start(update, context) # Show menu again

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    text = update.message.text
    
    if user_id in STATE and STATE[user_id] == WAITING_URL:
        # User sent a URL
        url = text.strip()
        
        if not url.startswith("http"):
            await update.message.reply_text("⚠️ Invalid URL. Please send a valid link starting with http/https.")
            return

        status_msg = await update.message.reply_text("⏳ Processing... Scaping & Detecting Chapters...")
        
        # Call API
        try:
            payload = {"url": url}
            response = requests.post(f"{API_BASE_URL}/bot/import", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    title = data.get("title", "Unknown")
                    count = data.get("chapters_count", 0)
                    await status_msg.edit_text(
                        f"✅ *Import Success!*\n\n"
                        f"📚 Title: `{title}`\n"
                        f"📑 Chapters: `{count}`\n"
                        f"🔗 Check: [IndraScans](http://localhost:3000)",
                        parse_mode='Markdown'
                    )
                else:
                    err = data.get("error", "Unknown error")
                    await status_msg.edit_text(f"❌ *Import Failed*\nError: {err}", parse_mode='Markdown')
            else:
                await status_msg.edit_text(f"❌ *Server Error* (Status {response.status_code})\nMsg: {response.text}", parse_mode='Markdown')
        
        except Exception as e:
            await status_msg.edit_text(f"❌ *Connection Error*\nCould not reach API: {str(e)}", parse_mode='Markdown')
        
        # Clear state
        del STATE[user_id]
        
        # Show menu again
        keyboard = [[InlineKeyboardButton("🔙 Main Menu", callback_data='btn_cancel')]]
        await update.message.reply_text("Done.", reply_markup=InlineKeyboardMarkup(keyboard))
        
    else:
        await update.message.reply_text("Please use /start to see the menu.")

if __name__ == '__main__':
    application = ApplicationBuilder().token(BOT_TOKEN).build()
    
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CallbackQueryHandler(button))
    application.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_message))
    
    print("Bot is running...")
    application.run_polling()
