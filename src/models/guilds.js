module.exports = function(bot) {
    bot.models.guild = bot.bs.Model.extend({
        tableName: 'guilds',
        channels: () => {
            this.hasMany(bot.models.channels);
        },
        users: () => {
            this.hasMany(bot.models.users);
        }
    });
};