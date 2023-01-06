const bcrypt = require('bcryptjs');
const glob = require('../../global');
const axios = require('axios');

async function executeRelayRequest(method, endpoint, body = {}) {
    const res = await axios({
        method: method,
        url: process.env.RELAY_HOST + endpoint,
        // headers: {
        //     "Authorization": "Bearer " + process.env.API_DB_TOKEN,
        // },
        data: body
    }).catch(e => e.response);
    if (res === undefined)
        return (false);
    return res;
}

function addProperty(queryString, property, value) {
    if (queryString.length > 0)
        queryString += ", ";
    queryString += `${property} = '${value}'`;
    return queryString;
}

function getUpdateQueryString(req) {
    let updateQueryString = "";

    if (req.body.hasOwnProperty('password')) {
        const passwordHash = bcrypt.hashSync(req.body.password);
        updateQueryString = addProperty(updateQueryString, 'password', passwordHash);
    }
    if (req.body.hasOwnProperty('cookies')) {
        const cookiesHash = glob.encryptString(req.body.cookies);
        updateQueryString = addProperty(updateQueryString, 'cookies', cookiesHash);
    }
    if (req.body.hasOwnProperty('email')) {
        updateQueryString = addProperty(updateQueryString, 'email', req.body.email);
        updateQueryString = addProperty(updateQueryString, 'cookies_status', 'wait');
    }
    if (req.body.hasOwnProperty('cookies_status') && !req.body.hasOwnProperty('email'))
        updateQueryString = addProperty(updateQueryString, 'cookies_status', req.body.cookies_status);
    if (req.body.hasOwnProperty('user_id'))
        updateQueryString = addProperty(updateQueryString, 'user_id', req.body.user_id);
    if (req.body.hasOwnProperty('channel_id'))
        updateQueryString = addProperty(updateQueryString, 'channel_id', req.body.channel_id);
    if (req.body.hasOwnProperty('last_testRunId'))
        updateQueryString = addProperty(updateQueryString, 'last_testRunId', req.body.last_testRunId);
    if (req.body.hasOwnProperty('discord_status'))
        updateQueryString = addProperty(updateQueryString, 'discord_status', req.body.discord_status);
    return updateQueryString;
}

module.exports = async function(app, con) {
    app.get("/user/id/:id", glob.verifyToken, async (req, res) => {
        if (!glob.verifyAuth(req, res, true)) {
            !res.headersSent ? res.status(403).json({ msg: "Authorization denied" }) : 0;
            return;
        }
        const queryString = (req.token === process.env.OTHER_APP_TOKEN) ? `*` : `id, email, user_id, channel_id, cookies_status, discord_status, created_at`;
        con.query(`SELECT ${queryString} FROM user WHERE id = "${req.params.id}" OR email = "${req.params.id}";`, function (err, rows) {
            if (err)
                res.status(500).json({ msg: "Internal server error" });
            else if (rows[0]) {
                glob.decryptAllCookies(rows);
                res.send(rows[0]);
            } else
                res.sendStatus(404);
        });
    });

    app.put("/user/id/:id", glob.verifyToken, async (req, res) => {
        if (!glob.is_num(req.params.id)) {
            res.status(400).json({ msg: "Bad parameter" });
            return;
        }
        if (!glob.verifyAuth(req, res, true)) {
            !res.headersSent ? res.status(403).json({ msg: "Authorization denied" }) : 0;
            return;
        }

        const updateQueryString = getUpdateQueryString(req);
        if (updateQueryString.length === 0) {
            res.status(400).json({ msg: "Bad parameter" });
            return;
        }

        con.query(`SELECT email FROM user WHERE id = ${req.params.id}`, (err1, oldRows) => {
            if (err1)
                res.status(500).json({ msg: "Internal server error" })
            else if (oldRows[0]) {
                con.query(`UPDATE user SET ${updateQueryString} WHERE id = "${req.params.id}";`, (err2, result) => {
                    if (err2)
                        res.status(500).json({ msg: "Internal server error" });
                    else if (result.affectedRows > 0) {
                        const selectQueryString = (req.token === process.env.OTHER_APP_TOKEN) ? `*` : `id, email, user_id, channel_id, cookies_status, discord_status, created_at`;
                        con.query(`SELECT ${selectQueryString} FROM user WHERE id = "${req.params.id}";`, (err3, newRows) => {
                            if (err3)
                                res.status(500).json({ msg: "Internal server error" });
                            else {
                                if (req.body.hasOwnProperty('email'))
                                    executeRelayRequest('DELETE', `/account/delete/${oldRows[0].email}`);
                                glob.decryptAllCookies(newRows);
                                res.status(200).send(newRows[0]);
                            }
                        });
                    } else
                        res.sendStatus(404);
                });
            } else
                res.sendStatus(404);
        });
    });

    app.delete("/user/id/:id", glob.verifyToken, async (req, res) => {
        if (!glob.is_num(req.params.id)) {
            res.status(400).json({ msg: "Bad parameter" });
            return;
        }
        if (!glob.verifyAuth(req, res, true)) {
            !res.headersSent ? res.status(403).json({ msg: "Authorization denied" }) : 0;
            return;
        }
        con.query(`SELECT email FROM user WHERE id = ${req.params.id}`, function (err, rows) {
            if (err)
                res.status(500).json({ msg: "Internal server error" })
            else {
                con.query(`DELETE FROM user WHERE id = "${req.params.id}";`, function (err, result) {
                    if (err)
                        res.status(500).json({ msg: "Internal server error" });
                    else if (rows[0] && result.affectedRows !== 0) {
                        executeRelayRequest('DELETE', `/account/delete/${rows[0].email}`);
                        res.status(200).json({ msg: `Successfully deleted record number: ${req.params.id}` });
                    } else
                        res.sendStatus(404);
                });
            }
        });
    });
}
