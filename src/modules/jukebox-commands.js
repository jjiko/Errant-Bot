const __ = require('iterate-js');
const Discord = require('discord.js');
const logger = require('../logger.js');
const songtypes = [
    //'spotify',
    'youtube'
];
const search = require('youtube-search');
const moment = require('moment');

module.exports = function (bot) {
    bot.commands = __.fuse(bot.commands || {}, {
        play: msg => {
            let embed = new Discord.RichEmbed();
            embed.setColor(8467967);
            embed.setAuthor(msg.author.username, msg.author.avatarURL);

            if (bot.queue.count === 0) {
                embed.setTitle(":no_entry_sign:");
                embed.setDescription(msg.trans ? 'Add some songs to the queue first' : 'No remaining songs in the queue');
                return msg.channel.send({embed});
            }

            if (!msg.guild.voiceConnection)
                return bot.commands.join(msg).then(() => bot.commands.play(msg));

            if (bot.queue.first.playing) {
                embed.setTitle(":no_entry_sign: Already playing a song");
                embed.setDescription('---');
                return msg.channel.send({embed});
            }

            bot.paused = false;
            bot.jukebox.play(bot.queue.first, msg);
        },

        pause: msg => {
            let track = bot.queue.first;
            if (track && track.dispatcher) {
                bot.queue.first.paused = true;
                track.dispatcher.pause();
                msg.channel.send(`:pause_button: "${track.title}" paused`);
            }
        },

        resume: msg => {
            let track = bot.queue.first;
            if (track && track.dispatcher) {
                bot.queue.first.paused = false;
                track.dispatcher.resume();
                msg.channel.send(`:play_pause: "${track.title}" resumed`);
            }
        },

        time: msg => {
            let track = bot.queue.first;
            if (track && track.dispatcher) {
                let time = track.dispatcher.time / 1000;
                msg.channel.send(':clock2: time: {0} / {1}'
                    .format(moment('00:00:00', 'HH:mm:ss').add(time, 's').format('HH:mm:ss'), track.length));
            }
        },

        search: msg => {
            console.log(`Searching for.. ${msg.details.trim()}`);

            let opts = {
                maxResults: 10,
                key: process.env.YOUTUBE_KEY,
                type: "video"
            };

            search(msg.details.trim(), opts, function (err, results) {
                if (err) return logger.error(err);
                if (results.length) {
                    let embed = new Discord.RichEmbed();
                    embed.setTitle("YouTube search results");
                    embed.setColor(8467967);
                    embed.setAuthor(msg.author.username, msg.author.avatarURL);
                    embed.setDescription(`Select from the list of results`);
                    __.all(results, function (result, i) {
                        if (!result.description) {
                            result.description = "No description.";
                        }
                        embed.addField(`\`${i}.\`   ${result.title}`, result.description);
                    });

                    msg.channel.send({embed})
                        .then(() => {
                            msg.channel.awaitMessages(response => response.author.id === msg.author.id, {
                                max: 1,
                                time: 60000,
                                errors: ['time'],
                            })
                                .then((collected) => {
                                    let i = collected.first().content;
                                    if (!isNaN(i) && typeof(results[i]) !== "undefined") {
                                        msg.details = results[i].link;
                                        bot.commands.youtube(msg);
                                    }
                                })
                                .catch(() => {
                                    msg.channel.send('There was no collected message that passed the filter within the time limit!');
                                });
                        });
                }
                else {
                    msg.channel.send(`:thumbsdown: no results found for search "${msg.details.trim()}"`);
                }
            })
        },

        youtube: msg => {
            let search = msg.details.trim();

            let targets = [];
            if (search[0] === '(' && search[search.length - 1] === ')') {
                search = search.replace('(', '').replace(')', '');
                targets = search.split(',');
            } else
                targets.push(search);

            __.all(targets, target => {
                let track = {type: 'youtube', search: target.trim(), requestor: msg.author.username};
                bot.queue.enqueue(track);
                bot.jukebox.info(track, msg, (err, info) => {
                    if (info) {
                        track.title = info ? info.title : 'Song';
                        track.length = moment('00:00:00', 'HH:mm:ss').add(parseInt(info.length_seconds), 's').format('HH:mm:ss');
                    }
                    msg.channel.send(`:heavy_plus_sign: Youtube Enqueued: "${track.title}" @ #${bot.queue.indexOf(track) + 1}`);
                });
            });
        },

        add: msg => {
            bot.commands.enqueue(msg);
        },

        enqueue: msg => {
            let parts = msg.details.split(':'),
                type = parts.shift().trim(),
                search = parts.join(':').trim();

            if (parts.length > 0 && songtypes.indexOf(type) > -1) {
                let targets = [];
                if (search[0] === '(' && search[search.length - 1] === ')') {
                    search = search.replace('(', '').replace(')', '');
                    targets = search.split(',');
                } else
                    targets.push(search);

                __.all(targets, target => {
                    let track = {type: type, search: target.trim(), requestor: msg.author.username};
                    bot.queue.enqueue(track);
                    bot.jukebox.info(track, msg, (err, info) => {
                        if (info) {
                            track.title = info ? info.title : 'Song';
                            track.length = moment('00:00:00', 'HH:mm:ss').add(parseInt(info.length_seconds), 's').format('HH:mm:ss');
                        }
                        msg.channel.send(`:heavy_plus_sign: Enqueued: "${track.title}" @ #${bot.queue.indexOf(track) + 1}`);
                    });
                });
            } else {
                msg.channel.send('Invalid Song Format, try: "{0}enqueue youtube:https://www.youtube.com/watch?v=dQw4w9WgXcQ"'
                    .format(bot.config.command.symbol));
            }
        },

        remove: msg => {
            bot.commands.dequeue(msg);
        },

        dequeue: msg => {
            let songidx = msg.details.trim();
            if (songidx != '') {
                songidx = parseInt(songidx) - 1;
                if (songidx == 0) {
                    bot.commands.stop(msg);
                }
                let track = bot.queue.at(songidx);
                msg.channel.send(`:heavy_minus_sign: Dequeued: ${track.title}`);
                bot.queue.remove((track, idx) => idx == songidx);
            }
        },

        skip: msg => {
            let track = bot.queue.first;
            if (track && track.dispatcher && msg && msg.channel) {
                track.dispatcher.end();
                msg.channel.sendMessage(`:fast_forward: "${track.title}" skipped`);
            }
        },

        stop: msg => {
            let track = bot.queue.first;
            if (track && track.dispatcher && msg && msg.channel) {
                track.playing = false;
                track.dispatcher.end();
                bot.paused = false;
                msg.channel.send(`:stop_button: "${track.title}" stopped`);
            }
        },

        // @alias list
        np: msg => {
            bot.commands.list(msg);
        },

        // Display now playing & queued songs
        list: msg => {
            let embed = new Discord.RichEmbed();
            embed.setTitle("Queue");
            embed.setColor(8467967);
            embed.setAuthor(msg.author.username, msg.author.avatarURL);
            embed.setDescription(`__**Now Playing**__
*${bot.queue.first.title}* 
    Requested by: \`${bot.queue.first.requestor}\`
            `);

            // track.type
            let list = __.map(bot.queue.list, (track, idx) => `\`${idx + 1}.\` *${track.title}* ${track.requestor ? ` Requested by \`${track.requestor}\`` : ''}`);
            if (list.length > 0) {
                embed.addField("Up Next", list.join('\n'));
                msg.channel.send({embed});
            }
            else {
                msg.channel.send(':cd: There are no songs in the queue.');
            }
        },

        clear: msg => {
            bot.commands.stop(msg);
            bot.queue.clear();
            msg.channel.send(':cd: Playlist Cleared');
        },

        move: msg => {
            let parts = msg.details.split(' '),
                current = parts[0],
                target = null;
            if (current && current !== '') {
                current = parseInt(current) - 1;
                let track = bot.queue.at(current);
                target = parts[1].contains('up', true) ? current - 1 : (parts[1].contains('down', true) ? current + 1 : -1);
                if (target >= 0 && target <= bot.queue.count - 1) {
                    if (current === 0 || target === 0)
                        bot.commands.stop(msg);
                    bot.queue.move(current, target);
                    msg.channel.send(`:arrow_${target > current ? 'down' : 'up'}: Track: ${track.title} Moved to #${target + 1}`);
                }
            }
        },

        shuffle: msg => {
            bot.commands.stop(msg);
            bot.queue.shuffle();
            msg.channel.send(':arrows_counterclockwise: Queue Shuffled');
        },

        volume: msg => {
            let volume = msg.details.trim();
            if (volume !== '') {
                volume = __.math.between(parseInt(volume), 0, 100);
                volume = (volume / 100) * (1.5) + bot.config.stream.volumeBase;

                let track = bot.queue.first;
                if (track && track.dispatcher)
                    track.dispatcher.setVolume(volume);
                bot.config.stream.volume = volume;
                msg.channel.send(`:speaker: Volume set to ${volume * 100}%`);
            } else
                msg.channel.send(`:speaker: Volume set to ${bot.config.stream.volume * 100}%`);
        },

        repeat: msg => {
            bot.config.queue.repeat = !bot.config.queue.repeat;
            msg.channel.send(`Repeat mode is ${bot.config.queue.repeat ? 'on' : 'off'}`);
        },

        playlist: msg => {
            let parts = msg.details.split(':'),
                action = parts[0].toLowerCase(),
                operation = parts[1];
            __.switch(action, {
                save: () => {
                    if (operation != undefined) {
                        bot.playlist.save(operation);
                        msg.channel.send(`Playlist: "${operation}" has been saved`);
                    }
                },
                load: () => {
                    if (operation != undefined) {
                        bot.commands.stop(msg);
                        bot.playlist.load(operation);
                        msg.channel.send(`Playlist: "${operation}" has been loaded`);
                    }
                },
                delete: () => {
                    if (operation != undefined) {
                        bot.playlist.delete(operation);
                        msg.channel.send(`Playlist: "${operation}" has been deleted`);
                    }
                },
                list: () => {
                    let playlists = bot.playlist.list();
                    playlists = __.map(playlists, (x, y) => '`{0}.` {1}'.format(y + 1, x));
                    msg.channel.send(playlists.length > 0 ? playlists.join('\n') : 'There are no saved playlists');
                }
            });
        }
    });
};