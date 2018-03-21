module.exports = function(bot) {
    bot.models.channels = bot.bs.Model.extend({
        tableName: 'activities'
    });
};