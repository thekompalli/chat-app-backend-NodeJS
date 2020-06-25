const moment = require('moment');

const genMessage = (username, msg) => {
    return {
        username,
        msg,
        createdAt: moment(new Date().getTime()).format('h:mm A')
    }
}

module.exports = {
    genMessage
}