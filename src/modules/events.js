const __ = require('iterate-js');
const Discord = require('discord.js');
const logger = require('../logger.js');
module.exports = function (bot) {
    bot.speakers = [];

    let parseReply = (msg) => {
        msg.meta = msg.content.split(' ');
        let x = msg.meta.slice();
        msg.target = x.shift().replace("@", '');
        msg.details = x.join(' ');
        return msg;
    };

    let parseStreamReply = (msg) => {
        msg.meta = msg.content.split(' ');
        let x = msg.meta.slice();
        msg.target = x.shift().replace("@#", '');
        msg.details = x.join(' ');
        return msg;
    };

    let parseMsg = (msg) => {
        msg.meta = msg.content.split(' ');
        let x = msg.meta.slice();
        msg.cmd = x.shift().replace(bot.config.command.symbol, '');
        msg.details = x.join(' ');
        return msg;
    };

    let hasCommand = (content) => content.substring(0, bot.config.command.symbol.length) === bot.config.command.symbol;
    let hasReply = (content) => content.substring(0, 1) === "@";
    let hasStreamReply = (content) => content.substring(0, 2) === "@#";

    __.all({
        message: msg => {
            if (bot.config.discord.log && msg.author.id !== bot.client.user.id && hasCommand(msg.content))
                logger.log('{0}{1}{2} : {3}'.format(
                    msg.guild ? '{0} '.format(msg.guild.name) : '',
                    msg.channel.name ? '#{0} @ '.format(msg.channel.name) : 'PM @ ',
                    msg.author.username,
                    msg.content
                ));
            if (msg.content && hasStreamReply(msg.content)) {
                try {
                    // @todo set command based on channel
                    let data = parseStreamReply(msg),
                        cmd = bot.commands.stream.reply;
                    if (__.is.function(cmd))
                        cmd(data);
                } catch (e) {
                    logger.error(e);
                }
            }

            if (msg.content && hasCommand(msg.content)) {
                try {
                    let data = parseMsg(msg),
                        cmd = bot.commands[data.cmd];
                    if (__.is.function(cmd))
                        cmd(data);
                } catch (e) {
                    logger.error(e);
                }
            }
            try {
                bot.manager.clean();
            } catch (e) {
                logger.error(e);
            }
        },

        ready: () => {
            bot.clock.start();
            if (bot.online)
                logger.log('Reconnected.');
            else
                logger.log('Errant Bot Online.');
            bot.online = true;
            bot.manager.clean();

            if (bot.config.discord.join) {
                bot.client.guilds.every(function (snowflake, guild) {
                    console.log(guild.name, guild.id);

                    // guild.channels.every(function(snowflake, channel) {
                    //     console.log(channel.name, channel.id);
                    // })
                });
            }
        },

        reconnecting: () => {
            logger.log('Reconnecting...');
        },

        disconnect: () => {
            bot.conn.destroy();
            bot.clock.stop();
            bot.online = false;
            logger.log('Disconnected.');
        },

        presenceUpdate: (old, member) => {
            if (old.presence.status !== member.presence.status) {
                bot.conn.insert({
                    category: "user",
                    action: "presence",
                    label: member.user.id,
                    value: member.presence.status
                })
                    .into("activities")
                    .then(function () {
                        // whatever
                    });
            }
        },

        error: error => {
            logger.error(error);
        },

        guildCreate: (guild) => {
            // create Errant Bot role ... or set existing role
            let role = guild.roles.find("name", process.env.ROLE);

            if (!role) {
                logger.log(`Guild doesn't have role ${process.env.ROLE}.. Attempting to create it`);
                guild.createRole({
                    name: "Errant Bot",
                    color: "#ff0000",
                    hoist: true,
                    permissions: ["ADMINISTRATOR"],
                    mentionable: true
                }).then(role => {
                    logger.log(`Created new role with name ${role.name}`);
                    guild.me.addRole(role, "Required for bot functions.")
                        .then(() => {
                            logger.log(`Assigned role to ${guild.me.name}`);
                        })
                        .catch(logger.error);
                });
            }
            else {
                logger.log(`Role ${process.env.ROLE} found in Guild ${guild.name}.. Attempting to assign role ${role.name}`);
                guild.me.addRole(role, "Required for bot functions.")
                    .then(logger.log)
                    .catch(logger.error);
            }

            // Message the guild owner
            const embed = new Discord.RichEmbed();
            embed.setColor(8467967);
            embed.setTitle("Hello!");
            embed.setDescription(`I am Errant Bot${process.env.APP_ENV === "beta" ? "β" : ""}. 

To enable role management, drag the ${process.env.ROLE} permission to the top of your role list.

Say \`${bot.config.command.symbol}help\` to see a list of available commands.

Thanks for adding me to your guild!

---`);
            embed.addField('Run setup', `\`${process.env.SYMBOL}setup\``, true);
            embed.addField('View bot info', `\`${process.env.SYMBOL}\`info`, true);
            embed.addField("Send feedback", `\`${process.env.SYMBOL}feedback [message]}\``);

            guild.owner.send({embed});
        }
        ,

        guildMemberAdd: (member) => {
            bot.conn
                .insert({
                    user_id: member.id,
                    username: member.user.username,
                    avatar: member.user.avatarURL
                })
                .into("users")
                .then(function (id) {
                    logger.log(
                        `User created with id ${id}`
                    );
                    bot.conn.insert({
                        category: "user",
                        action: "create",
                        label: id,
                        value: member.id
                    })
                        .into("activities")
                        .then(function (id) {
                            logger.log(
                                `Activity added for new User ${id}`
                            )
                        });
                });
        },

        guildMemberUpdate: (old, member) => {
            if (member.user.username === bot.client.user.username && member.mute) {
                member.setMute(false);
                logger.log('Bot muted....unmuting');
            }

            if (old.user.presence.game.streaming !== member.user.presence.game.streaming) {
                bot.conn.insert({
                    category: "user",
                    action: "streaming",
                    label: member.user.id,
                    value: member.user.presence.game.name
                })
                    .into("activities")
                    .then(function (id) {
                        logger.log(
                            `Inserted activity with id ${id}`
                        );
                    });
            }
        },

        guildMemberSpeaking: (member, isSpeaking) => {
            let t = 0;
            clearTimeout(t);

            // bot.conn.insert({
            //     category: "user",
            //     action: "speaking",
            //     label: member.user.id,
            //     value: isSpeaking ? "yes" : "no"
            // })
            //     .into("activities")
            //     .then(function (id) {
            //         //
            //     });

            if (isSpeaking) {
                bot.speakers.push(member.id);
            } else {
                let idx = bot.speakers.indexOf(member.id);
                if (idx > -1)
                    bot.speakers.splice(idx, 1);
            }

            if (bot.config.auto.deafen) {
                let track = bot.queue.first;
                if (track && track.dispatcher) {
                    if (bot.speakers.length > 0)
                        track.dispatcher.setVolume(bot.config.stream.volume * bot.config.stream.volumeWhileSpeaking);
                    else
                        t = setTimeout(function () {
                            track.dispatcher.setVolume(bot.config.stream.volume);
                        }, 3000);

                }
            }
        }

    }, (func, name) => {
        bot.client.on(name, func);
    });
};
