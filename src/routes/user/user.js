var glob = require('../../global');

const SECRET = glob.myenv.SECRET;

module.exports = async function(app, con) {
    app.get("/user", glob.verifyToken, async (req, res) => {
        if (!glob.verifyAuth(req, res, false)) {
            !res.headersSent ? res.status(403).json({ msg: "Authorization denied" }) : 0;
            return;
        }
        let queryString = (req.token === glob.myenv.OTHER_APP_TOKEN) ? `*` : `id, email, password, server_id, channel_id, cookies_status, created_at`;
        con.query(`SELECT ${queryString} FROM user;`, function (err2, rows) {
            if (err2) res.status(500).json({ msg: "Internal server error" });
            res.send(rows);
        });
    });
}
