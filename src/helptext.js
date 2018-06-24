const __ = require('iterate-js');
const Discord = require('discord.js');
const help = [
    {
        title: [":hash:", "Channel"],
        commands: [
            '{PRE}join [channel]: "Join your voice channel"',
            '{PRE}leave: "Leave current voice channel"',
            '{PRE}search [query]: "Search youtube for query, adds first result to queue"',
            '{PRE}youtube [url/last fragment of url]: "Short alias to enqueue youtube tracks" Ex: `{PRE}youtube (2PD1I5k0-ZY, fxOjcjl3TFU)`',
        ]
    },
    {
        title: [":musical_note:", "Playback"],
        commands: [
            '{PRE}play: "Start playing the current song"',
            '{PRE}pause: "Pause the current song"',
            '{PRE}resume: "Resume the current song"',
            '{PRE}skip: "Skip the current song"',
            '{PRE}stop: "Stop and reset the current song"',
            '{PRE}volume [0-100 or nothing]: "Set volume to a number between 0-100" Ex: `{PRE}volume 43`',
            '{PRE}time: "Time of the current song"',
        ]
    },
    {
        title: [":1234:", "Queue/Playlist"],
        commands: [
            '{PRE}enqueue [type] [url/last fragment]: Add a song to the end of the queue',
            '{PRE}dequeue [index]: Remove a song from the queue',
            '{PRE}add [type] [url/fragment]: Alias for enqueue',
            '{PRE}remove [index]: Alias for dequeue',
            '{PRE}move [index of song] [up/down]: Move a song up or down in the queue" Ex: `{PRE}move 4 up`',
            '{PRE}repeat: Toggle playlist repeat mode',
            '{PRE}shuffle: Shuffle songs in the queue, will stop current song',
            '{PRE}clear: Clear songs in the queue',
            '{PRE}list or {PRE}np: List songs in the queue',
            '{PRE}playlist [save/load/delete/list][playlist name]: Ex: `{PRE}playlist save:Calamity`   Ex: `{PRE}playlist load:Calamity`'
        ]
    },
    {
        title: [":heavy_plus_sign:", "More commands"],
        commands: [
            // '{PRE}ping: Check if the bot is online',
            '{PRE}invite: Generate invite link to add this bot to your guild',
            '{PRE}status: show bot stats'
        ]
    }
];
module.exports = {
    get: function (symbol = "!", username, avatarUrl) {
        let embeds = [];
        let titles = [];
        let fields = 0;

        let createEmbedObject = function () {
            let embed = new Discord.RichEmbed();

            embed.setTitle("Errant Bot :question: Help");
            embed.setColor(8467967);
            embed.setAuthor(username, avatarUrl);
            embed.setDescription(`Use \`${symbol}more\` for commands not listed here`);

            return embed;
        };

        let addField = function (x) {
            let arr = x.split(":");
            let name = arr[0].replace(/{PRE}/g, symbol);
            arr.shift();
            let value = arr.join(" ");

            embed.addField(`\`${name}\``, value.trim().replace(/{PRE}/g, symbol), true);
        };


        let embed = createEmbedObject();
        __.all(help, function (v, i) {
            // Limit 25 fields per message
            if ((fields + v.commands.length + 1) > 25) {
                fields = 0;
                let clone = Object.assign(Object.create(Object.getPrototypeOf(embed)), embed);
                embeds.push(clone);
                embed = createEmbedObject();
            }

            fields++;
            embed.addField(v.title[0] + "   " + v.title[1], "---");
            if (typeof(titles[embeds.length]) === "undefined") {
                titles[embeds.length] = "";
            }
            titles[embeds.length] += v.title[1] + "#";
            __.all(v.commands, function (command, i) {
                fields++;
                addField(command);
            });
        });
        embeds.push(embed);
        return {titles, embeds};
    }
};
