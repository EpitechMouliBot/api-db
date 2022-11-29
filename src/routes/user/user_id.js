var glob = require('../../global');

module.exports = async function(app, con) {
    app.get("/user/id/:id", glob.verifyToken, async (req, res) => {
        if (!glob.verifyAuth(req, res, true)) {
            !res.headersSent ? res.status(403).json({ msg: "Authorization denied" }) : 0;
            return;
        }
        let queryString = (req.token === glob.myenv.OTHER_APP_TOKEN) ? `*` : `id, email, user_id, channel_id, cookies_status, created_at`;
        con.query(`SELECT ${queryString} FROM user WHERE id = "${req.params.id}" OR email = "${req.params.id}";`, function (err, rows) {
            if (err) res.status(500).json({ msg: "Internal server error" });
            if (rows[0])
                res.send(rows[0]);
            else
                res.status(200).json({ msg: "Not found"});
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
        var ret = false;
        if (req.body.hasOwnProperty('email')) {
            con.query(`UPDATE user SET email = "${req.body.email}" WHERE id = "${req.params.id}";`, function (err, result) {
                if (err) res.status(500).json({ msg: "Internal server error" });
            });
            ret = true;
        }
        if (req.body.hasOwnProperty('password')) {
            con.query(`UPDATE user SET password = "${req.body.password}" WHERE id = "${req.params.id}";`, function (err, result) {
                if (err) res.status(500).json({ msg: "Internal server error" });
            });
            ret = true;
        }
        if (req.body.hasOwnProperty('user_id')) {
            con.query(`UPDATE user SET user_id = "${req.body.user_id}" WHERE id = "${req.params.id}";`, function (err, result) {
                if (err) res.status(500).json({ msg: "Internal server error" });
            });
            ret = true;
        }
        if (req.body.hasOwnProperty('channel_id')) {
            con.query(`UPDATE user SET channel_id = "${req.body.channel_id}" WHERE id = "${req.params.id}";`, function (err, result) {
                if (err) res.status(500).json({ msg: "Internal server error" });
            });
            ret = true;
        }
        if (req.body.hasOwnProperty('last_testRunId')) {
            con.query(`UPDATE user SET last_testRunId = "${req.body.last_testRunId}" WHERE id = "${req.params.id}";`, function (err, result) {
                if (err) res.status(500).json({ msg: "Internal server error" });
            });
            ret = true;
        }
        if (req.body.hasOwnProperty('cookies_status')) {
            con.query(`UPDATE user SET cookies_status = "${req.body.cookies_status}" WHERE id = "${req.params.id}";`, function (err, result) {
                if (err) res.status(500).json({ msg: "Internal server error" });
            });
            ret = true;
        }
        if (req.body.hasOwnProperty('cookies')) {
            con.query(`UPDATE user SET cookies = '${req.body.cookies}' WHERE id = "${req.params.id}";`, function (err, result) {
                if (err) res.status(500).json({ msg: "Internal server error" });
            });
            ret = true;
        }

        if (ret === true) {
            let queryString = (req.token === glob.myenv.OTHER_APP_TOKEN) ? "*" : "id, email, password, user_id, channel_id, cookies_status, created_at";
            con.query(`SELECT ${queryString} FROM user WHERE id = "${req.params.id}";`, function (err, rows) {
                if (err) res.status(500).json({ msg: "Internal server error" });
                res.status(200).send(rows);
            });
        } else
            res.status(400).json({ msg: "Bad parameter" });
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
        con.query(`DELETE FROM user WHERE id = "${req.params.id}";`, function (err, result) {
            if (err) res.status(500).json({ msg: "Internal server error" });
            if (result.affectedRows != 0)
                res.status(200).json({ msg: `Successfully deleted record number: ${req.params.id}` });
            else
                res.status(200).json({ msg: "Not found"});
        });
    });
}
