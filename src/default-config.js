const __ = require('iterate-js');

module.exports = function(bot, config) {
    bot.config = new __.lib.Config({
        auto: new __.lib.Config({
            deafen: true,
            pause: false,
            play: true,
            reconnect: true
        }),
        command: new __.lib.Config({
            symbol: '!'
        }),
        discord: new __.lib.Config({
            token: '<BOT-TOKEN>',
            log: true,
            manage: new __.lib.Config({
                channels: []
            })
        }),
        defaults: new __.lib.Config({

        }),
        queue: new __.lib.Config({
            announce: true,
            repeat: false
        }),
        spotify: new __.lib.Config({
            id: '<BOT-ID>',
            secret: '<BOT-SECRET>',
            token: null
        }),
        stream: new __.lib.Config({
            seek: 0,
            passes: 5, //can be increased to reduce packetloss at the expense of upload bandwidth, 4-5 should be lossless at the expense of 4-5x upload
            volume: 0.07,
            volumeWhileSpeaking: 0.01
        })
    });
    bot.config.update(config);
};
