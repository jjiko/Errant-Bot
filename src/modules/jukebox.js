
const __ = require('iterate-js');
const youtube = require('ytdl-core');

const infohandlers = {

    youtube: function(search, cb) {
        let url = search.contains('://') ? search : 'https://www.youtube.com/watch?v=' + search;
        youtube.getInfo(url, cb);
    }

};

const handlers = {

    youtube: function(bot, msg, track) {
        let url = track.search.contains('://') ? track.search : 'https://www.youtube.com/watch?v=' + track.search;
        track.dispatcher = msg.guild.voiceConnection.playStream(youtube(url, { audioonly: true }), bot.config.stream);
    }

};

module.exports = function(bot) {
    bot.jukebox = {
        play: function(track, msg) {
            if(bot.config.queue.announce) {
                if(track.title)
                    msg.channel.sendMessage(`*Playing* :musical_note: \`${track.title}\` *Requested by ${track.requestor}*`);
            }
            track.playing = true;
            let handler = handlers[track.type];
            if(handler) {
                handler(bot, msg, track);
                if(track.dispatcher) {
                    track.dispatcher.on('end', () => {
                        if(track.playing) {
                            track.playing = false;
                            let lasttrack = bot.queue.dequeue();
                            if(bot.config.queue.repeat)
                                bot.queue.lastTrack = lasttrack;
                                bot.queue.enqueue(lasttrack);
                            msg.trans = true;
                            bot.commands.play(msg);
                            setTimeout(() => {
                                track.dispatcher = null;
                            }, 100);
                        }
                    });
                    track.dispatcher.on('error', (err) => {
                        bot.commands.skip(msg);
                        return msg.channel.sendMessage('error: ' + err);
                    });
                }
            } else
                msg.channel.sendMessage(`:no_entry_sign: Improper track type: "${track.type}"`);
        },
        info: function(track, msg, cb) {
            let handler = infohandlers[track.type];
            if(handler)
                handler(track.search, cb);
            else
                msg.channel.sendMessage(`:no_entry_sign: Improper track type: "${track.type}"`);
        }
    };
};