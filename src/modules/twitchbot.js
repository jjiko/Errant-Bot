const TwitchBot = require('twitch-bot');
const Discord = require('discord.js');
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
                    logger.log(JSON.stringify(chatter));
                    logger.log(`@twitch message received from channel ${chatter.channel.replace("#", '')}, ${chatter.username}: ${chatter.message}`);
                    bot.models.options.where({
                        option_name: "stream_chat_channel",
                        option_label: chatter.channel.replace("#", ''),
                        type: "guild"
                    })
                        .fetch()
                        .then(model => {
                            logger.log(`@twitch looping options model ${model.get('option_label')}, related_id ${model.get('related_id')}`);
                            let guild = bot.client.guilds.get(model.get('related_id'));
                            let channel = guild.channels.get(model.get('option_value'));

                            let embed = new Discord.RichEmbed();
                            //embed.setAuthor(`${chatter.channel}`, "https://cdn.joejiko.com/img/discord/twitch_favicon-0.png",);
                            embed.setTitle(`twitch.tv/${chatter.channel.replace("#", '')}`);
                            embed.setDescription(`${chatter.message}`);
                            embed.setURL(`https://www.twitch.tv/${chatter.channel.replace("#", "")}`);
                            embed.setThumbnail(guild.iconURL);

                            if (chatter.hasOwnProperty("badges") && chatter.badges) {
                                if (chatter.badges.broadcaster === 1) {
                                    embed.setAuthor(chatter.username, "https://cdn.joejiko.com/img/discord/winner.png");
                                    embed.setColor(8467967); // purple
                                }
                                else {
                                    embed.setAuthor(chatter.username);
                                    embed.setColor(49139); // blue
                                }
                            }
                            else if (chatter.mod) {
                                embed.setAuthor(chatter.username, "https://cdn.joejiko.com/img/discord/moderator.png");
                                embed.setColor(16744503); // orange
                            }
                            else if (chatter.subscriber) {
                                embed.setAuthor(chatter.username, "https://cdn.joejiko.com/img/discord/subscriber.png");
                                embed.setColor(65280); // green
                            }
                            else {
                                embed.setAuthor(chatter.username);
                                embed.setColor(49139); // blue
                            }
                            embed.setFooter(`${chatter.channel}`, "https://cdn.joejiko.com/img/discord/twitch_favicon-0.png");
                            channel.send({embed});
                        })
                        .catch(logger.error);
                    // .fetchAll()
                    // .then(collection => {
                    //     collection.forEach(model => {
                    //         logger.log(`@twitch looping options model ${model.getAttribute('option_label')}`);
                    //         let guild = bot.client.guilds.find(guild => guild.get('id') === model.getAttribute('related_id'));
                    //         let channel = guild.channels.find(channel => channel.get('id') === model.getAttribute('option_value'));
                    //         if (channel) {
                    //             channel.send(`\`(${chatter.channel}) ${chatter.user}:\`   ${chatter.message}`);
                    //         }
                    //     });
                    // });
                    if (chatter.message === '!commands') {
                        bot.twitch.say('!tell me about jeffers')
                    }

                    if (chatter.message === '!tell me about jeffers') {
                        bot.twitch.say('Oh i know all about that guy.. type !secrets to learn more', chatter.channel);
                    }

                    if (chatter.message === '!secrets') {
                        bot.twitch.say('Haha fool! There are no secrets :|', chatter.channel);
                    }

                    if (chatter.message === '!queso') {
                        bot.twitch.say('Everything about Queso is a lie', chatter.channel);
                    }
                }
            );
        }
    }
    ;
}
;