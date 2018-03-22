const __ = require('iterate-js');
const Discord = require('discord.js');
const moment = require('moment');
const request = require('request');
const logger = require('../logger.js');

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

        },

        live: msg => {
            const channels = ["jjiko", "vashton"];
            __.all(channels, function (channel) {
                const url = `https://api.twitch.tv/kraken/streams/${channel}?client_id=${process.env.TWITCH_CLIENT_ID}`;
                request(url, (error, response, body) => {
                    if (!error && response.statusCode === 200) {
                        let t = JSON.parse(body);
                        logger.log(url);
                        logger.log(body);

                        if (t.stream !== null && t.stream.stream_type === "live") {
                            let embed = new Discord.RichEmbed();
                            embed.setAuthor(`${t.stream.channel.name} is now streaming!`, "https://storage.googleapis.com/cdn.joejiko.com/img/discord/twitch_favicon-0.png", t.stream.channel.url);
                            embed.setTitle(t.stream.channel.url);
                            embed.setDescription('---');
                            embed.setURL(t.stream.channel.url);
                            embed.setTimestamp(t.stream.created_at);
                            embed.setThumbnail(t.stream.channel.logo);
                            embed.addField("Now Playing", t.stream.game);
                            embed.addField("Stream Title", t.stream.channel.status);
                            embed.addField("Followers", t.stream.channel.followers);
                            embed.addField("Viewers", t.stream.viewers, true);
                            embed.addField("Total Views", t.stream.channel.views, true);
                            embed.setImage(t.stream.channel.profile_banner);
                            embed.setFooter("Streaming since");
                            msg.channel.send({embed});
                        }
                        else {
                            msg.channel.send(`${channel} is offline :(`);
                        }
                    }
                });
            });
        }
    });

};
