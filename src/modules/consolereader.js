
const readline = require('readline');

module.exports = function(bot) {

    let commands = {

        say: function(reader, input) {
            let parts = input.replace('say', '').trim().split('@'),
                guild = parts.shift(),
                channel = parts.shift(),
                text = parts.join('@');
            
            let targetguild = bot.client.guilds.find(g => g.name.contains(guild));
            if(targetguild) {
                let targetchannel = targetguild.channels.find(c => c.name.contains(channel));
                if(targetchannel)
                    targetchannel.send(text);
            }
        },

        exit: function(reader) {
            bot.disconnect()
                .then(() => {
                    reader.close();
                });
        }

    };

    bot.console = {
        listen: function() {
            let rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.on('line', input => {
                let parts = input.split(' '),
                    cmd = parts[0];
                if(commands[cmd])
                    commands[cmd](rl, input);
            });
        }
    };
};