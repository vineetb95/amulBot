import { makeRequestWithRetries } from "./sendRequest";
import dotenv from 'dotenv';
dotenv.config();

import { sendTelegramMessage } from "./telegram";
import { AxiosResponse } from "axios";
import express from 'express';

let entryfileStartedMsgPromise = sendTelegramMessage('Bot process entryfile started running!');

const productNames: string[] = [
    'Amul Whey Protein Gift Pack, 32 g | Pack of 10 sachets',
    'Amul Whey Protein, 32 g | Pack of 30 Sachets',
    'Amul Whey Protein, 32 g | Pack of 60 Sachets',
    'Amul Chocolate Whey Protein Gift Pack, 34 g | Pack of 10 sachets',
    'Amul Chocolate Whey Protein, 34 g | Pack of 30 sachets',
    'Amul Chocolate Whey Protein, 34 g | Pack of 60 sachets',
    'Amul High Protein Plain Lassi, 200 mL | Pack of 30',
    'Amul Kool Protein Milkshake | Chocolate, 180 mL | Pack of 30'
];

let timeSinceEverythingWentOutOfStock = -1;

async function pollAmulApi() {
    // send request to amul
    let response: AxiosResponse;
    try {
        response = await makeRequestWithRetries()
    } catch (err) {
        console.log('Error occurred while making request to amul api');
        console.log(err.message);
        await sendTelegramMessage(`Err: ${err.toString()}, cause: ${err.cause}, message: ${err.message}`);
        process.exit(1);
    }

    let productDataArr: { name: string, available: number }[] = response.data.data;

    for (const productData of productDataArr) {
        const { available, name } = productData;
        if (productNames.includes(name) && available === 1) {
            console.log(`${name} is available! sending notification...`);
            await sendTelegramMessage(`${name} is available to buy!`);
        }

        if (name.includes('whey') || name.includes('Whey') && available === 1) {
            await sendTelegramMessage(`${name} is available to buy!`);
        }
    }

    let isEverythingOutOfStock = true;
    for (const { available } of productDataArr) {
        isEverythingOutOfStock = isEverythingOutOfStock && available == 0;
    }

    if (!isEverythingOutOfStock) {
        timeSinceEverythingWentOutOfStock = -1;
        return;
    }

    if (timeSinceEverythingWentOutOfStock === -1) {
        timeSinceEverythingWentOutOfStock = Date.now();
        return;
    }

    if (Date.now() - timeSinceEverythingWentOutOfStock > 1000 * 60 * 60 * 24) {
        await sendTelegramMessage('Everything is out of stock for last 24 hrs!');
        timeSinceEverythingWentOutOfStock = Date.now();
    }
}

async function main() {
    await entryfileStartedMsgPromise;

    await sendTelegramMessage('Beginning to poll!')
    let timeout = setTimeout(pollHelper, 10 * 1000);

    async function pollHelper() {
        await pollAmulApi();
        clearTimeout(timeout);
        timeout = setTimeout(pollHelper, 10 * 1000);
    }
}

main();

// every 24 hrs send a health check to telegram
setInterval(async () => {
    await sendTelegramMessage('Telegram bot is healthy!')
}, 24*60*60*1000);


// Handle graceful shutdown and unexpected errors
const notifyAndExit = async (reason: string) => {
    console.error(`Bot process crashed: reason: ${reason}`);
    await sendTelegramMessage(`Bot process crashed: reason: ${reason}`);

    if (reason.includes('Error: 409: Conflict: terminated by other getUpdates request')) {
        // Don't exit because gcp expects the app to not crash
        // process.exit(0);
    } else {
        process.exit(1);
    }

};

process.on('SIGINT', () => notifyAndExit('SIGINT (Ctrl+C) received'));
process.on('SIGTERM', () => notifyAndExit('SIGTERM received'));
process.on('uncaughtException', (err) => notifyAndExit(`Uncaught Exception: ${err}`));
process.on('unhandledRejection', (reason) => notifyAndExit(`Unhandled Rejection: ${reason}`));

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('AmulBot is running!');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});