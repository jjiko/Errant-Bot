const WebSocket = require('ws');
const Discord = require('discord.js');
const logger = require('../logger.js');

const format = {
    data: (data) => {
        return JSON.parse(data);
    },
    tagName: (tag) => {
        if (tag.includes('-')) {
            tag = tag.replace(/-/g, '_')
        }
        if (tag.includes('@')) {
            tag = tag.replace('@', '')
        }
        return tag.trim()
    },
    tagVal: (val) => {
        if (!val) return null;
        if (val.match(/^[0-9]+$/) !== null) {
            return +val
        }
        if (val.includes('\s')) {
            val = val.replace(/\\s/g, ' ')
        }
        return val.trim()
    },
    tags: (tagstring) => {
        let tagObject = {};
        const tags = tagstring.replace(/\s/g, ' ').split(';');

        tags.forEach(tag => {
            const split_tag = tag.split('=');
            const name = format.tagName(split_tag[0]);
            let val = format.tagVal(split_tag[1]);
            tagObject[name] = val;
        });

        if (tagObject.data) {
            tagObject.data = format.data(tagObject.data)
        }

        return tagObject
    }
};

module.exports = function (bot) {
    bot.wss = {
        wss: null,
        listen: function (port = 9000) {
            this.wss = new WebSocket.Server({port});
            this.wss.on('error', err => {
                logger.log("WS Server error " + err);
            });
            this.wss.on('listening', () => {
                logger.log("WS API Listening on 9000");
            });

            this.wss.on('connection', ws => {

                ws.on('message', msg => {
                    if (msg.includes("ACTIVITY ")) {
                        let event = msg.split("ACTIVITY ")[1];
                        let parsed = format.tags(event);

                        if (parsed.category === "TwitchStream") {
                            parsed.channel = parsed.label;
                            parsed.game = parsed.data.stream.game;
                            parsed.logo = parsed.data.stream.channel.logo;
                            parsed.preview = parsed.data.stream.preview.large;
                            parsed.status = parsed.data.stream.channel.status;
                            parsed.timestamp = parsed.data.stream.channel.updated_at;
                            parsed.url = parsed.data.stream.channel.url;
                            parsed.viewers = parsed.data.stream.viewers;

                            if (parsed.action === "created") {
                                // send message new stream created
                            }

                            if (parsed.action === "streaming") {
                                // send message still streaming
                            }

                            // Send message to streaming channel
                            let guild = bot.client.guilds.get("424470303901745153");
                            let channel = guild.channels.get("425659434040033282");
                            let content = `@everyone ${parsed.channel} is now live on Twitch ${parsed.url}`;
                            let embed = new Discord.RichEmbed();
                            embed.setTitle(`${parsed.status}`);
                            embed.setURL(`${parsed.url}`);
                            embed.setColor(4929148);
                            embed.setTimestamp(parsed.timestamp);
                            embed.setThumbnail(`${parsed.logo}`);
                            embed.setImage(`${parsed.preview}`);
                            embed.setAuthor(parsed.channel, parsed.logo, parsed.url);
                            embed.addField("Game", parsed.game, true);
                            embed.addField("Viewers", parsed.viewers, true);
                            embed.setFooter(`twitch.tv/${parsed.channel} last updated at`, "https://cdn.joejiko.com/img/discord/twitch_favicon-0.png");

                            channel.send(content, {embed});

                        }
                        logger.log(`Activity event triggered (!) ${parsed.category} ${parsed.action}`);
                    }
                });
                ws.send("Completed?");
            });

        }
    };
};