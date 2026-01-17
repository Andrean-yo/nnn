
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, CallbackQueryHandler, MessageHandler, filters
import requests
import json
import os

# Configuration
BOT_TOKEN = "7832542206:AAHnZDjxGM463ic8xDVdYyF_xcKDVAq6a7I"
API_BASE_URL = "http://localhost:3000/api"

# States
STATE = {}
WAITING_URL = "waiting_url"
WAITING_RANGE = "waiting_range"

# Store temp data
TEMP_DATA = {}

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("📤 Import Manhwa", callback_data='btn_import')],
        # [InlineKeyboardButton("📊 Stats", callback_data='btn_status')],
        [InlineKeyboardButton("❌ Cancel", callback_data='btn_cancel')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text('🤖 *IndraScans Bot*\nReady to work.', reply_markup=reply_markup, parse_mode='Markdown')

async def button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    
    if query.data == 'btn_import':
        STATE[user_id] = WAITING_URL
        await query.edit_message_text("🔗 *Send URL*:\nKirim Link Manhwa Raw yang mau diimport.", parse_mode='Markdown')

    elif query.data == 'btn_confirm_all':
        if user_id in TEMP_DATA:
            url = TEMP_DATA[user_id]['url']
            await perform_import(update, context, url, mode='import')
            # Clean up
            if user_id in STATE: del STATE[user_id]
            if user_id in TEMP_DATA: del TEMP_DATA[user_id]
        else:
            await query.edit_message_text("❌ Session expired. Please start again.")

    elif query.data == 'btn_custom_range':
        STATE[user_id] = WAITING_RANGE
        data = TEMP_DATA.get(user_id, {})
        start = data.get('range_start', 1)
        end = data.get('range_end', 10)
        await query.edit_message_text(
            f"🔢 *Custom Range*\n"
            f"Detected chapters: {start} to {end}\n\n"
            f"Kirim format: `Start-End`\n"
            f"Contoh: `1-50`", 
            parse_mode='Markdown'
        )

    elif query.data == 'btn_cancel':
        if user_id in STATE: del STATE[user_id]
        if user_id in TEMP_DATA: del TEMP_DATA[user_id]
        await query.edit_message_text("Action cancelled.")
        await start(update, context)

async def perform_import(update: Update, context: ContextTypes.DEFAULT_TYPE, url, mode='preview', range_data=None):
    if update.message:
        msger = update.message
    elif update.callback_query:
        msger = update.callback_query.message
    else:
        return

    status_msg = await msger.reply_text("⏳ Processing...")
    
    try:
        payload = {"url": url, "mode": mode}
        if range_data:
            payload["range"] = range_data

        response = requests.post(f"{API_BASE_URL}/bot/import", json=payload)
        
        if response.status_code != 200:
            await status_msg.edit_text(f"❌ *Server Error* ({response.status_code})\nMsg: {response.text}", parse_mode='Markdown')
            return

        data = response.json()
        
        if not data.get("success"):
            await status_msg.edit_text(f"❌ *API Error*: {data.get('error')}", parse_mode='Markdown')
            return

        # Handle PREVIEW Success
        if mode == 'preview':
            meta = data.get('data', {})
            title = meta.get('title', 'Unknown')
            thumb = meta.get('thumbnail')
            count = meta.get('total_chapters', 0)
            desc = meta.get('description', '')
            r_start = meta.get('range_start', 1)
            r_end = meta.get('range_end', count)

            # Store for next step
            user_id = update.effective_user.id
            TEMP_DATA[user_id] = {
                'url': url,
                'range_start': r_start,
                'range_end': r_end
            }

            caption = (
                f"📖 *{title}*\n\n"
                f"📝 {desc}\n\n"
                f"📚 Detected: *{count}* Chapters\n"
                f"🔍 Range: {r_start} - {r_end}"
            )
            
            keyboard = [
                [InlineKeyboardButton(f"✅ Import All ({count})", callback_data='btn_confirm_all')],
                [InlineKeyboardButton("⚙️ Custom Range", callback_data='btn_custom_range')],
                [InlineKeyboardButton("❌ Cancel", callback_data='btn_cancel')]
            ]

            await status_msg.delete()
            if thumb and thumb.startswith('http'):
                await msger.reply_photo(photo=thumb, caption=caption, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode='Markdown')
            else:
                await msger.reply_text(caption, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode='Markdown')

        # Handle IMPORT Success
        elif mode == 'import':
            title = data.get('title')
            imported = data.get('imported_count')
            rng = data.get('range')
            
            await status_msg.edit_text(
                f"✅ *Import Success!*\n\n"
                f"📖 Title: {title}\n"
                f"📥 Imported: {imported} Chapters\n"
                f"🔢 Range: {rng}",
                parse_mode='Markdown'
            )

    except requests.exceptions.ConnectionError:
        await status_msg.edit_text(
            "❌ *Connection Error*\n"
            "Bot tidak bisa menghubungi Server Next.js.\n\n"
            "⚠️ **Solusi**: Pastikan Anda sudah menjalankan `npm run dev` di terminal laptop Anda.",
            parse_mode='Markdown'
        )
    except Exception as e:
        await status_msg.edit_text(f"❌ *Error*: {str(e)}", parse_mode='Markdown')

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    text = update.message.text
    
    if user_id in STATE and STATE[user_id] == WAITING_URL:
        if not text.startswith("http"):
            await update.message.reply_text("⚠️ Invalid URL.")
            return
        
        await perform_import(update, context, text, mode='preview')

    elif user_id in STATE and STATE[user_id] == WAITING_RANGE:
        # Parse 1-10
        try:
            parts = text.split('-')
            start = int(parts[0].strip())
            end = int(parts[1].strip())
            
            if user_id in TEMP_DATA:
                url = TEMP_DATA[user_id]['url']
                await perform_import(update, context, url, mode='import', range_data={'from': start, 'to': end})
                
                # Cleanup
                if user_id in STATE: del STATE[user_id]
                if user_id in TEMP_DATA: del TEMP_DATA[user_id]
            else:
                await update.message.reply_text("❌ Session expired.")
        except:
            await update.message.reply_text("⚠️ Format salah. Gunakan: `Start-End` (contoh: 1-50)")

    else:
        # Ignore other text or show menu
        if text == '/start':
            await start(update, context)

if __name__ == '__main__':
    application = ApplicationBuilder().token(BOT_TOKEN).build()
    
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CallbackQueryHandler(button))
    application.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_message))
    
    print("Bot is running...")
    application.run_polling()
