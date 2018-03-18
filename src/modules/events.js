const __ = require('iterate-js');
const logger = require('../logger.js');

module.exports = function (bot) {
    bot.speakers = [];

    let parseMsg = (msg) => {
        msg.meta = msg.content.split(' ');
        let x = msg.meta.slice();
        msg.cmd = x.shift().replace(bot.config.command.symbol, '');
        msg.details = x.join(' ');
        return msg;
    };

    let hasCommand = (content) => content.substring(0, bot.config.command.symbol.length) === bot.config.command.symbol;

    __.all({
        message: msg => {
            if (bot.config.discord.log && msg.author.id !== bot.client.user.id && hasCommand(msg.content))
                logger.log('{0}{1}{2} : {3}'.format(
                    msg.guild ? '{0} '.format(msg.guild.name) : '',
                    msg.channel.name ? '#{0} @ '.format(msg.channel.name) : 'PM @ ',
                    msg.author.username,
                    msg.content
                ));
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

            if(bot.config.discord.join) {
                bot.client.guilds.every(function(snowflake, guild) {
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
            bot.clock.stop();
            bot.online = false;
            logger.log('Disconnected.');
        },

        error: error => {
            logger.error(error);
        },

        guildMemberUpdate: (old, member) => {
            if (member.user.username === bot.client.user.username && member.mute) {
                member.setMute(false);
                logger.log('Bot muted....unmuting');
            }
        },

        guildMemberSpeaking: (member, isSpeaking) => {
            let t = 0;
            clearTimeout(t);

            if (isSpeaking)
                bot.speakers.push(member.id);
            else {
                let idx = bot.speakers.indexOf(member.id);
                if (idx > -1)
                    bot.speakers.splice(idx, 1);
            }

            if (bot.config.auto.deafen) {
                let track = bot.queue.first;
                if (track && track.dispatcher) {
                    if (bot.speakers.length > 0)
                        track.dispatcher.setVolume(bot.config.stream.volumeWhileSpeaking);
                    else
                        t = setTimeout(function(){
                            track.dispatcher.setVolume(bot.config.stream.volume);
                        }, 3000);

                }
            }
        }

    }, (func, name) => {
        bot.client.on(name, func);
    });
};
