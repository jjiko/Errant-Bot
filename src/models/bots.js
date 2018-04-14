module.exports = function(bot) {
    bot.models.bots = bot.bs.Model.extend({
        tableName: 'guilds',
        guilds: () => {
            this.hasMany(bot.models.guilds);
        }
    });
};