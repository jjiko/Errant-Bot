module.exports = function(bot) {
    bot.models.channels = bot.bs.Model.extend({
        tableName: 'channels',
        channels: () => {
            this.hasOne(bot.models.guilds);
        }
    });
};