const moment = require("moment");

function formatMessage(username, content) {
    return {
        username,
        text: content,
        time: moment().format("HH:mm")
    };
}

module.exports = formatMessage;