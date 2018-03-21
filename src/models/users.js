module.exports = function (bot) {
    bot.models.channels = bot.bs.Model.extend({
        tableName: 'users',
        roles: () => {
            this.hasMany(bot.models.roles);
        }
    });
};