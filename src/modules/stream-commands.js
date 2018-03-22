const __ = require('iterate-js');
const logger = require('../logger.js');


module.exports = function (bot) {
    bot.commands = __.fuse(bot.commands || {}, {
        stream: {
            reply: msg => {
                logger.log(`Reply with content.. ${msg.content}, channel ${msg.channel.id}`);
                bot.models.options.where({
                    option_name: "stream_chat_channel",
                    option_value: msg.channel.id,
                    option_label: msg.target,
                    type: "guild"
                })
                    .fetch()
                    .then(model => {
                        if (model) {
                            bot.twitch.say(`(Discord) ${msg.author.username}: ${msg.details}`, `#${msg.target}`);
                        }
                    })
                    .catch(logger.error);
            }
        }
    });
};