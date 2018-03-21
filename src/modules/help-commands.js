const __ = require('iterate-js');
const Discord = require('discord.js');
const helpText = require('../helptext.js');

module.exports = function(bot) {
  bot.commands = __.fuse(bot.commands || {} , {
      help: msg => {
          let {titles, embeds} = helpText.get(bot.config.command.symbol, msg.author.username, msg.author.avatarURL);
          let embed = new Discord.RichEmbed();
          embed.setTitle("Errant Bot :question: Help");
          embed.setColor(8467967);
          embed.setAuthor(msg.author.username, msg.author.avatarURL);
          embed.setDescription(`What commands are you interested in?`);

          let choices = "";
          __.all(titles, function (title, i) {
              let thisTitle = title.split("#");
              thisTitle = thisTitle.filter(x => x).join(", ");
              choices += `\`${i}.\`   ${thisTitle}\n`;
          });
          embed.addField("Respond with the matching number", choices);
          msg.channel.send({embed})
              .then(() => {
                  msg.channel.awaitMessages(response => response.author.id === msg.author.id, {
                      max: 1,
                      time: 10000,
                      errors: ['time'],
                  })
                      .then((collected) => {
                          let i = collected.first().content;
                          if (!isNaN(i) && typeof(embeds[i]) !== "undefined") {
                              msg.channel.send({embed: embeds[i]});
                          }
                      })
                      .catch(() => {
                          // msg.channel.send('There was no collected message that passed the filter within the time limit!');
                      });
              });

      }
  });
};