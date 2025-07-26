import { Telegraf } from 'telegraf';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error('Invalid env configuration! TELEGRAM_BOT_TOKEN not found');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN)

const chatIds: Set<number> = new Set([ 1056709825 ]);

bot.on('message', (ctx) => {
  console.log(`Message recieved from user ${ctx.chat.first_name}`);
  chatIds.add(ctx.chat.id);
});

export async function sendTelegramMessage(msg: string) {
    for (const chatId of chatIds) {
        await bot.telegram.sendMessage(chatId, msg);
    }
}

bot.launch();
