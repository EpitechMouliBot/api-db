const axios = require('axios');

module.exports = async function executeRelayRequest(method, endpoint, body = {}) {
    const res = await axios({
        method: method,
        url: process.env.API_DB_HOST + endpoint,
        // headers: {
        //     "Authorization": "Bearer " + process.env.API_DB_TOKEN,
        // },
        data: body
    }).catch(e => e.response);
    if (res == undefined)
        return (false);
    return res;
}
