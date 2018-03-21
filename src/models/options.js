module.exports = function (bot) {
    bot.models.options = bot.bs.Model.extend({
        tableName: 'options'
    });
};