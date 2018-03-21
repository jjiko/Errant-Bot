const __ = require('iterate-js');

module.exports = function (bot) {
    bot.commands = __.fuse(bot.commands || {}, {
        kick: msg => {

        },

        ban: msg => {

        },

        editguild: msg => {

        },

        addrole: msg => {

        }
    });
};