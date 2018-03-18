const __ = require('iterate-js');
const Discord = require('discord.js');
const channel = [
    '{PRE}join [channel]: "Join your voice channel"',
    '{PRE}leave: "Leave current voice channel"',
    '{PRE}search [query]: "Search youtube for query, adds first result to queue"',
    '{PRE}youtube [url/last fragment of url]: "Short alias to enqueue youtube tracks" Ex: `{PRE}youtube (2PD1I5k0-ZY, fxOjcjl3TFU)`',
];
const playback = [
    '{PRE}play: "Start playing the current song"',
    '{PRE}pause: "Pause the current song"',
    '{PRE}resume: "Resume the current song"',
    '{PRE}skip: "Skip the current song"',
    '{PRE}stop: "Stop and reset the current song"',
    '{PRE}volume [0-100 or nothing]: "Set volume to a number between 0-100" Ex: `{PRE}volume 43`',
    '{PRE}time: "Time of the current song"',
];
const queue = [
    '{PRE}enqueue [type] [url/last fragment]: "Add a song to the end of the queue"',
    '{PRE}dequeue [index]: "Remove a song from the queue"',
    '{PRE}add [type] [url/fragment]: "Alias for enqueue"',
    '{PRE}remove [index]: "Alias for dequeue"',
    '{PRE}move [index of song] [up/down]: "Move a song up or down in the queue" Ex: `{PRE}move 4 up`',
    '{PRE}repeat: "Toggle playlist repeat mode"',
    '{PRE}shuffle: "Shuffle songs in the queue, will stop current song"',
    '{PRE}clear: "Clear songs in the queue"',
    '{PRE}list: "List all songs in the queue"',
    '{PRE}playlist [save/load/delete/list][playlist name]: Ex: `{PRE}playlist save:Calamity`   Ex: `{PRE}playlist load:Calamity`'
];
const more = [
    '{PRE}ping: "Check if the bot is online"',
];

module.exports = {
    get: function (symbol = "!", username, avatarUrl) {
        const embed = new Discord.RichEmbed();

        embed.setTitle("Errant Bot :question: Help");
        embed.setColor(8467967);
        embed.setAuthor(username, avatarUrl);
        embed.setDescription(`Use \`${symbol}more\` for commands not listed here`);

        let addField = function (x) {
            let arr = x.split(":");
            let name = arr[0];
            arr.shift();
            let value = arr.join(" ");

            embed.addField(`\`${name}\``, value.trim().replace(/{PRE}/g, symbol), true);
        };

        embed.addField(":hash: Channel", "");
        __.all(channel, function (x) {
            addField(x)
        });

        embed.addField(":musical_note: Playback", "");
        __.all(playback, function (x) {
            addField(x)
        });

        embed.addField(":1234: Queue/Playlist", "");
        __.all(queue, function (x) {
            addField(x)
        });

        embed.addField(":heavy_plus_sign: More", "");
        __.all(more, function (x) {
            addField(x)
        });

        return embed;
    }
};
