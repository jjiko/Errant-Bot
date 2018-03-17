const __ = require('iterate-js');
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
    get: function (symbol, client) {
        let formattedHelpText = {
            embed: {
                color: "8135FF",
                author: client.user.username,
                icon_url: client.user.avatarUrl
            },
            title: "Errant Bot :question: Help",
            description: "Use `!more` for commands not listed here",
            fields: []
        };

        let formatField = function(x) {
            let arr = x.split(":");
            let name = arr[0];
            arr.shift();
            let value = arr.join(" ");

            let text = x.replace("{PRE}", symbol);
            let field = {
                "name": `\`${name}\``,
                "value": value.trim(),
                "inline": true
            };
        };

        formattedHelpText.fields.push({
           "name": ":hash: Channel",
           "value": ""
        });
        __all(channel, function (x) {
            formattedHelpText.fields.push(formatField(x));
        });

        formattedHelpText.fields.push({
            "name": ":musical_note: Playback",
            "value": ""
        });
        __all(playback, function (x) {
            formattedHelpText.fields.push(formatField(x));
        });

        formattedHelpText.fields.push({
            "name": ":1234: Queue/Playlist",
            "value": ""
        });
        __all(queue, function (x) {
            formattedHelpText.fields.push(formatField(x));
        });

        formattedHelpText.fields.push({
            "name": ":heavy_plus_sign: More",
            "value": ""
        });
        __all(more, function (x) {
            formattedHelpText.fields.push(formatField(x));
        });

        return formattedHelpText;
    }
};
