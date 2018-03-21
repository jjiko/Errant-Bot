module.exports = function (bot) {
    bot.models.channels = bot.bs.Model.extend({
        tableName: 'roles',
        users: () => {
            this.hasMany(bot.models.users);
        }
    });
};