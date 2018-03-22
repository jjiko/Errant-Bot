const __ = require('iterate-js');
const Discord = require('discord.js');
const moment = require('moment');

module.exports = function (bot) {

    bot.commands = __.fuse(bot.commands || {}, {

        // register: msg => {
        //     msg.channel.send(`Registering \`${msg.guild.memberCount}\` users`);
        //     msg.guild.members.forEach(function (member, id) {
        //         msg.channel.send(`+ registering ${id}
        //         dID: ${member.user.id}
        //         username: ${member.user.username}
        //         avatar: ${member.user.avatarURL}`);
        //         bot.conn.insert({
        //             dId: member.user.id,
        //             username: member.user.username,
        //             avatar: member.user.avatarURL
        //         }).into("users").then(function (id) {
        //             msg.channel.send(`User created with id \`${id}\``);
        //         });
        //     });
        // },

        invite: msg => {
            const embed = new Discord.RichEmbed();
            embed.setTitle("Errant Bot 📧 Invite");
            embed.setColor(8467967);
            embed.setAuthor(msg.author.username, msg.author.avatarURL);
            msg.client.generateInvite()
                .then(link => {
                    embed.setDescription(link);
                    msg.channel.send({embed});
                });
        },

        status: msg => {
            const embed = new Discord.RichEmbed();

            embed.setTitle("Errant Bot 📜 Status");
            embed.setColor(8467967);
            embed.setAuthor(msg.author.username, msg.author.avatarURL);
            embed.setDescription(`Bot's status in the world`);

            embed.addField("Ping", Math.round(msg.client.ping), true);
            embed.addField("Uptime", moment.duration(msg.client.uptime, "seconds").humanize(), true);
            embed.addField("Guilds", msg.client.guilds.size, true);
            embed.addField("Text", (msg.client.channels.size - msg.client.voiceConnections.size), true);
            embed.addField("Voice", msg.client.voiceConnections.size, true);
            embed.addField("Total", msg.client.channels.size, true);

            msg.channel.send({embed});
        },

        ping: msg => {
            let phrases = [
                `Can't stop won't stop!`,
                `:ping_pong: Pong Bitch!`
            ];
            let random = (array) => {
                return array[Math.floor(Math.random() * array.length)];
            };
            if (msg.guild)
                phrases = phrases.concat(msg.guild.emojis.array());
            msg.channel.send(random(phrases));
        },

        join: msg => {
            return new Promise((resolve, reject) => {
                let voicechannel = msg.member.voiceChannel;
                if (voicechannel && voicechannel.type === 'voice') {
                    voicechannel.join()
                        .then(connection => {
                            bot.speakers = [];
                            if (bot.config.auto.play)
                                bot.commands.play(msg);
                            resolve(connection);
                            msg.channel.sendMessage(`:speaking_head: Joined channel: ${voicechannel.name}`);
                        }).catch(err => reject(err));
                } else
                    return msg.channel.sendMessage("I couldn't connect to your voice channel.");
            });
        },

        leave: msg => {
            bot.commands.stop();
            bot.client.voiceConnections.every(connection => {
                connection.disconnect();
                msg.channel.sendMessage(`:mute: Disconnecting from channel: ${connection.channel.name}`);
            });

        }
    });

};
