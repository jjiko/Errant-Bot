const __ = require('iterate-js');
const Discord = require('discord.js');
const logger = require('../logger.js');

let roles = [];
let roleChoices = "";
let options;

const setupFinished = (msg) => {
    const embed = new Discord.RichEmbed();
    embed.setTitle("✔️ Setup complete");
    embed.setColor(8467967);
    embed.setAuthor(msg.guild.me.user.username, msg.guild.me.user.avatarURL);
    embed.setDescription("That's all for now 😃\n\nHow about adding some songs to a playlist?");

    msg.channel.send({embed});
};

const setupAdminRole = (msg) => {
    // @todo check for option before running setup.. or use a bot_setup_progress option?
    const embed = new Discord.RichEmbed();
    embed.setColor(8467967);
    embed.setAuthor(msg.guild.me.user.username, msg.guild.me.user.avatarURL);
    embed.setTitle("Default bot admin role");
    embed.setDescription(roleChoices);
    msg.channel.send({embed})
        .then(() => {
            msg.channel.awaitMessages(response => response.author.id === msg.guild.ownerID, {
                max: 1,
                time: 300000,
                errors: ['time']
            })
                .then((collected) => {
                    let i = collected.first().content;
                    if (!isNaN(i) && typeof(roles[i]) !== "undefined") {
                        msg.channel.send(`Default bot role set to \`${roles[i].role}\``)
                            .then(setupDJRole);
                    }
                })
                .catch(() => {
                    // msg.channel.send('There was no collected message that passed the filter within the time limit!');
                });
        });
};

const setupDJRole = msg => {
    const embed = new Discord.RichEmbed();
    embed.setTitle("DJ (music) bot role");
    embed.setColor(8467967);
    embed.setAuthor(msg.guild.me.user.username, msg.guild.me.user.avatarURL);
    embed.setDescription(roleChoices);

    msg.channel.send({embed})
        .then(() => {
            msg.channel.awaitMessages(response => response.author.id === msg.guild.ownerID, {
                max: 1,
                time: 300000,
                errors: ['time']
            })
                .then((collected) => {
                    let i = collected.first().content;
                    if (!isNaN(i) && typeof(roles[i]) !== "undefined") {
                        msg.channel.send(`DJ (music) bot role set to \`${roles[i].role}\``)
                            .then(setupDJRoleRequired);
                    }
                })
                .catch(() => {
                    // msg.channel.send('There was no collected message that passed the filter within the time limit!');
                });
        });
};

const setupDJRoleRequired = msg => {
    const embed = new Discord.RichEmbed();
    embed.setTitle("Require DJ role to control music?");
    embed.setColor(8467967);
    embed.setAuthor(msg.guild.me.user.username, msg.guild.me.user.avatarURL);
    embed.setDescription(`\`1.\`  Yes\n\`2.\`  No`);

    msg.channel.send({embed})
        .then(() => {
            msg.channel.awaitMessages(response => response.author.id === msg.guild.ownerID, {
                max: 1,
                time: 300000,
                errors: ['time']
            })
                .then((collected) => {
                    let i = collected.first().content;
                    let msgText;

                    if (!isNaN(i)) {
                        if (parseInt(i) === 1) {
                            msgText = `DJ role will be \`required\` to control music.`;
                        }
                        else if (parseInt(i) === 2) {
                            msgText = `\`Everyone\` can control music.`;
                        }

                        if (msgText) {
                            msg.channel.send(msgText).then(setupFinished);
                        }

                        // @todo ask again?
                    }
                })
                .catch(() => {
                    // @todo ask again
                    // msg.channel.send('There was no collected message that passed the filter within the time limit!');
                });
        });
};

module.exports = function (bot) {

    const ownerCheck = msg => {
        return msg.guild.ownerID === msg.author.id;
    };

    bot.commands = __.fuse(bot.commands || {}, {
        dbinit: msg => {
            if (!ownerCheck(msg)) {
                msg.channel.send("You must be the Guild owner to use this command.");
                return;
            }

            let default_option_keys = ['admin_role', 'dj_role', 'dj_role_required'];
            __.all(default_option_keys, function (option_name) {
                let option = new bot.models.options({
                    type: 'guild',
                    related_id: msg.guild.id,
                    option_name
                });
                if (option.isNew()) {
                    option.save()
                        .then(function (model) {
                            logger.log(`Option saved with name ${model.get('option_name')}, guild ${model.get('related_id')}`);
                        })
                        .catch(err => {
                            logger.error(err);
                        });
                }
                else {
                    logger.log(`Option !isNew with name ${option.get('option_name')}, guild ${option.get('related_id')}`)
                }
            });
        },
        db: msg => {
            if (!ownerCheck(msg)) {
                msg.channel.send("You must be the Guild owner to use this command.");
                return;
            }

            bot.models.options
                .where({type: 'guild', related_id: msg.guild.id})
                .fetch()
                .then(function (collection) {
                    if (collection.size) {
                        logger.log(collection.toJSON());
                    }
                    else {
                        logger.log("No results");
                        msg.channel.send("`Database test` completed with no results.. check logs.");
                    }
                })
                .catch(() => {
                    msg.channel.send("`Database test` completed with errors.. check logs.");
                });

        },
        config: msg => {
            if (msg.meta.length > 2) {
                if (msg.meta[1] === "stream") {
                    let [command, category, action, value] = msg.meta;
                    logger.log(`${command} ${category} ${action} ${value}`);
                }
            }
            logger.log("Config meta: " + JSON.stringify(msg.meta));
        },
        setup: msg => {
            if (msg.guild.ownerID !== msg.author.id) {
                msg.channel.send("You must be the Guild owner to use this command.");
                return;
            }

            // @todo create a new message if roles exceed 25
            msg.guild.roles.forEach(function (role, id) {
                roles.push({id, role: role.name});
                roleChoices += `\`${roles.length - 1}.\`    ${role.name}\n`;
            });

            const embed = new Discord.RichEmbed();
            embed.setTitle("Config");
            embed.setColor(8467967);
            embed.setAuthor(msg.guild.me.user.username, msg.guild.me.user.avatarURL);
            embed.setDescription("Let's setup a few defaults..");
            msg.channel.send({embed}).then(setupAdminRole);
        }
    });
};