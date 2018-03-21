const TwitchBot = require('twitch-bot');
const logger = require('../logger.js');
module.exports = function (bot) {
    bot.twitch = {
        destroy: function () {
            this.bot.close();
        },
        say: function () {
            return this.bot.say.call(this.bot, ...arguments);
        },
        listen: function () {
            logger.log("Twitch bot online");
            logger.log("Listening");
            this.bot = new TwitchBot({
                username: process.env.TWITCH_BOT_USER,
                oauth: process.env.TWITCH_BOT_OAUTH,
                channels: ['jjiko', 'vashton']
            });

            // Connect Twitch bot
            this.bot.on('join', channel => {
                logger.log(`@twitch Joined channel ${channel}`);
            });

            this.bot.on('error', err => {
                logger.error(err);
            });

            this.bot.on('close', () => {
                logger.log('@twitch closed bot irc connection');
            });

            this.bot.on('ban', event => {
                logger.log(`@twitch user ${event.target_username} on ${event.channel} because ${event.ban_reason}`)
            });

            this.bot.on('userUpdate', event => {
                logger.log(`@twitch userUpdate on ${event.channel} (join) ${event.display_name} subscriber ${event.subscriber} mod ${event.mod} type ${event.user_type}`)
            });

            this.bot.on('subscription', event => {
                logger.log(`@twitch new subscription user ${event.login} on ${event.channel}`);
            });

            this.bot.on('message', chatter => {
                if (chatter.message === '!test') {
                    bot.twitch.say('Command executed! Eureka', chatter.channel);
                }
            });
        }
    };
};