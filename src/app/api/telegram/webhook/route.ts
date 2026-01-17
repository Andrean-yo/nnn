import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = "7832542206:AAHnZDjxGM463ic8xDVdYyF_xcKDVAq6a7I";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Helper to send messages
async function sendMessage(chatId: number, text: string, extra: any = {}) {
    return fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', ...extra })
    });
}

// Helper to edit messages
async function editMessageText(chatId: number, messageId: number, text: string, extra: any = {}) {
    return fetch(`${TELEGRAM_API}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, parse_mode: 'Markdown', ...extra })
    });
}

// Helper to send photo
async function sendPhoto(chatId: number, photo: string, caption: string, extra: any = {}) {
    return fetch(`${TELEGRAM_API}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, photo, caption, parse_mode: 'Markdown', ...extra })
    });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const set = searchParams.get('set');

    if (set) {
        const host = req.headers.get('host');
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const webhookUrl = `${protocol}://${host}/api/telegram/webhook`;

        const res = await fetch(`${TELEGRAM_API}/setWebhook?url=${webhookUrl}`);
        const data = await res.json();
        return NextResponse.json({ message: "Webhook attempted", data, webhookUrl });
    }

    return NextResponse.json({ message: "Telegram Webhook Endpoint" });
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        console.log('[Telegram Webhook Payload]:', JSON.stringify(payload, null, 2));

        if (payload.message) {
            const message = payload.message;
            const chatId = message.chat.id;
            const text = message.text;

            // 1. Handle Commands
            if (text === '/start') {
                await sendMessage(chatId, "🤖 *IndraScans Bot (Serverless)*\n\nSelamat datang! Gunakan menu di bawah untuk mengelola manhwa.", {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "📤 Import Manhwa", callback_data: "btn_import" }],
                            [{ text: "📊 Check Status", callback_data: "btn_status" }]
                        ]
                    }
                });
                return NextResponse.json({ ok: true });
            }

            // 2. Handle ForceReply (Capturing URL)
            const replyTo = message.reply_to_message;
            if (replyTo && replyTo.text?.includes("Kirimkan URL Manhwa")) {
                const url = text.trim();
                if (!url.startsWith('http')) {
                    await sendMessage(chatId, "⚠️ URL tidak valid. Kirim link yang diawali dengan `http`.");
                    return NextResponse.json({ ok: true });
                }

                // Call internal scraper API (using localhost if internal, or absolute if deployed)
                const host = req.headers.get('host');
                const protocol = host?.includes('localhost') ? 'http' : 'https';
                const scrapeRes = await fetch(`${protocol}://${host}/api/bot/import`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url, mode: 'preview' })
                });

                if (!scrapeRes.ok) {
                    await sendMessage(chatId, `❌ Gagal mengambil data. Status: ${scrapeRes.status}`);
                    return NextResponse.json({ ok: true });
                }

                const data = await scrapeRes.json();
                if (!data.success) {
                    await sendMessage(chatId, `❌ Error: ${data.error}`);
                    return NextResponse.json({ ok: true });
                }

                const meta = data.data;
                const caption = `📖 *${meta.title}*\n\n${meta.description}\n\n📚 Terdeteksi: *${meta.total_chapters}* Chapter\n🔍 Range: ${meta.range_start} - ${meta.range_end}\n\n[🔗](${url})`; // Hidden URL in link entity

                await sendPhoto(chatId, meta.thumbnail, caption, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: `✅ Import Semua (${meta.total_chapters})`, callback_data: `confirm_all` }],
                            [{ text: "⚙️ Custom Range", callback_data: `btn_range_step` }],
                            [{ text: "❌ Batalkan", callback_data: "cancel" }]
                        ]
                    }
                });
                return NextResponse.json({ ok: true });
            }

            // 3. Handle Custom Range Input
            if (replyTo && replyTo.text?.includes("rentang chapter")) {
                const entities = replyTo.entities || [];
                const linkEntity = entities.find((e: any) => e.type === 'text_link');
                const url = linkEntity?.url;

                if (!url) {
                    await sendMessage(chatId, "❌ Gagal mendeteksi URL asal. Silakan ulangi import.");
                    return NextResponse.json({ ok: true });
                }

                const parts = text.split('-');
                const start = parseInt(parts[0]);
                const end = parseInt(parts[1]);

                if (isNaN(start) || isNaN(end)) {
                    await sendMessage(chatId, "⚠️ Format salah. Gunakan `Start-End` (contoh: `1-50`) sebagai balasan.");
                    return NextResponse.json({ ok: true });
                }

                await sendMessage(chatId, `⏳ Mengimport chapter ${start} sampai ${end}...`);

                const host = req.headers.get('host');
                const protocol = host?.includes('localhost') ? 'http' : 'https';
                const importRes = await fetch(`${protocol}://${host}/api/bot/import`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url, mode: 'import', range: { from: start, to: end } })
                });

                const importData = await importRes.json();
                if (importData.success) {
                    await sendMessage(chatId, `✅ *Sukses Import!*\n\n📚 Judul: ${importData.title}\n📑 Total: ${importData.imported_count} Chapter.`);
                } else {
                    await sendMessage(chatId, `❌ Gagal: ${importData.error}`);
                }
                return NextResponse.json({ ok: true });
            }
        }

        if (payload.callback_query) {
            const query = payload.callback_query;
            const chatId = query.message.chat.id;
            const messageId = query.message.message_id;
            const data = query.data;

            if (data === 'btn_import') {
                await sendMessage(chatId, "🔗 *Kirimkan URL Manhwa Raw* yang ingin Anda import:", {
                    reply_markup: { force_reply: true }
                });
            }

            if (data === 'btn_status') {
                await sendMessage(chatId, "✅ Server Online & Webhook Active.");
            }

            if (data === 'confirm_all') {
                // Find URL from entities
                const entities = query.message.caption_entities || [];
                const linkEntity = entities.find((e: any) => e.type === 'text_link');
                const url = linkEntity?.url;

                if (!url) {
                    await sendMessage(chatId, "❌ Gagal menemukan URL untuk diimport.");
                    return NextResponse.json({ ok: true });
                }

                await editMessageText(chatId, messageId, "⏳ Mengimport semua chapter...");

                const host = req.headers.get('host');
                const protocol = host?.includes('localhost') ? 'http' : 'https';
                const importRes = await fetch(`${protocol}://${host}/api/bot/import`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url, mode: 'import' })
                });

                const importData = await importRes.json();
                if (importData.success) {
                    await editMessageText(chatId, messageId, `✅ *Sukses Import!*\n\n📚 Judul: ${importData.title}\n📑 Total: ${importData.imported_count} Chapter.`);
                } else {
                    await editMessageText(chatId, messageId, `❌ Gagal: ${importData.error}`);
                }
            }

            if (data === 'btn_range_step') {
                const entities = query.message.caption_entities || [];
                const linkEntity = entities.find((e: any) => e.type === 'text_link');
                const url = linkEntity?.url || "";

                await sendMessage(chatId, `🔢 *Kirimkan rentang chapter* (Format: Start-End)\nContoh: \`1-50\`\n\n[🔍 Source](${url})`, {
                    reply_markup: { force_reply: true }
                });
            }

            if (data === 'cancel') {
                await editMessageText(chatId, messageId, "❌ Aksi dibatalkan.");
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error('[Webhook Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
