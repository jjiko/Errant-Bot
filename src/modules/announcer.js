const EventEmitter = require('events');
class StreamEventEmitter extends EventEmitter {};
const Stream = new StreamEventEmitter();
const schedule = require('node-schedule');

module.exports = bot => {
    bot.announcer = {
        init() {
            let that = this;
            let rule = new schedule.RecurrenceRule();
            rule.minute = 10;
            let j = schedule.scheduleJob(rule, () => {
                // check for new streaming activity
            });
        },
        schedule() {

        },
        announce() {

        }
    }
};