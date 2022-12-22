const glob = require('../../global');

module.exports = async function(app, con) {
    app.get("/user", glob.verifyToken, async (req, res) => {
        if (!glob.verifyAuth(req, res, false)) {
            !res.headersSent ? res.status(403).json({ msg: "Authorization denied" }) : 0;
            return;
        }
        const queryString = (req.token === process.env.OTHER_APP_TOKEN) ? `*` : `id, email, user_id, channel_id, cookies_status, discord_status, created_at`;
        con.query(`SELECT ${queryString} FROM user;`, function (err, rows) {
            if (err) res.status(500).json({ msg: "Internal server error" });
            glob.decryptAllCookies(rows);
            res.send(rows);
        });
    });

    app.get("/user/status/:status", glob.verifyToken, async (req, res) => {
        if (!glob.verifyAuth(req, res, false)) {
            !res.headersSent ? res.status(403).json({ msg: "Authorization denied" }) : 0;
            return;
        }
        const queryString = (req.token === process.env.OTHER_APP_TOKEN) ? `*` : `id, email, user_id, channel_id, cookies_status, discord_status, created_at`;
        con.query(`SELECT ${queryString} FROM user WHERE cookies_status = "${req.params.status}";`, function (err, rows) {
            if (err) res.status(500).json({ msg: "Internal server error" });
            glob.decryptAllCookies(rows);
            res.send(rows);
        });
    });
}
