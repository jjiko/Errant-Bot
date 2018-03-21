const fs = require('fs');
const __ = require('iterate-js');
const Discord = require('discord.js');
const Queue = require('./queue.js');
const config = require('./default-config.js');
const models = __.map(fs.readdirSync('./src/models'), mod => require(`./models/${mod}`));
const modules = __.map(fs.readdirSync('./src/modules'), mod => require(`./modules/${mod}`));
const plugins = __.map(fs.readdirSync('./src/plugins'), mod => require(`./plugins/${mod}`));

// ORM
const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DATABASE,
        charset: 'utf8'
    }
});
const bookshelf = require('bookshelf')(knex);

module.exports = function (bot, cfg) {
    bot.dir = __dirname;
    bot.client = new Discord.Client();
    bot.conn = knex;
    bot.bs = bookshelf;
    bot.queue = new Queue();
    bot.models = [];
    config(bot, cfg);
    __.all(models, models => models(bot));
    __.all(modules, mod => mod(bot));
    __.all(plugins, plugin => plugin(bot));
};
