require('dotenv').load();

const ErrantBot = require('./src/errant-bot.js');
const logger = require('./src/logger.js');
const bot = new ErrantBot({
    command: {
        symbol: process.env.SYMBOL // command symbol trigger
    },
    discord: {
        token: process.env.DISCORD_TOKEN
    }
});

bot.connect()
    .then(() => {
        logger.log('Listening');
        bot.listen();

        // Start Twitch chatbot
        bot.twitch.listen();

        // Start WebSocket server
        bot.wss.listen();

        // Done
        process.send('ready');
    })
    .catch(err => {
        logger.error(err);
    });

let interruptCount = 0;
process.on('SIGINT', async () => {
    interruptCount++;
    if (interruptCount === 1) {
        logger.log('Received interrupt signal; destroying client and exiting...');
        await Promise.all([
            bot.twitch.destroy(),
            bot.client.destroy()
        ]).catch(err => {
            logger.error(err);
        });
        process.exit(0);
    } else {
        logger.log('Received another interrupt signal; immediately exiting.');
        process.exit(0);
    }
});

process.on('message', function (msg) {
    if (msg === 'shutdown') {
        console.log("Closing all connections...");
        bot.twitch.destroy();
        bot.disconnect();
        setTimeout(function () {
            console.log("Finished closing connections?");
            process.exit(0);
        }, 1500)
    }
});