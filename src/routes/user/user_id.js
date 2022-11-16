var glob = require('../../global');

module.exports = async function(app, con) {
    app.get("/user/:id", glob.verifyToken, async (req, res) => {
        if (glob.verifyAuth(req, res, true)) {
            con.query(`SELECT * FROM user WHERE id = "${req.params.id}" OR email = "${req.params.id}";`, function (err, rows) {
                if (err) res.status(500).json({ msg: "Internal server error" });
                if (rows[0])
                    res.send(rows[0]);
                else
                    res.status(200).json({ msg: "Not found"});
            });
        } else if (!res.headersSent) {
            res.status(403).json({ msg: "Authorization denied" });
        }
    });

    app.put("/user/:id", glob.verifyToken, async (req, res) => {
        if (!glob.is_num(req.params.id)) {
            res.status(400).json({ msg: "Bad parameter" });
            return;
        }
        if (glob.verifyAuth(req, res, true)) {
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
            if (ret == true) {
                con.query(`SELECT * FROM user WHERE id = "${req.params.id}";`, function (err, rows) {
                    if (err) res.status(500).json({ msg: "Internal server error" });
                    res.status(200).send(rows);
                });
            } else
                res.status(400).json({ msg: "Bad parameter" });
        } else if (!res.headersSent) {
            res.status(403).json({ msg: "Authorization denied" });
        }
    });

    app.delete("/user/:id", glob.verifyToken, async (req, res) => {
        if (!glob.is_num(req.params.id)) {
            res.status(400).json({ msg: "Bad parameter" });
            return;
        }
        if (glob.verifyAuth(req, res, true)) {
            con.query(`DELETE FROM user WHERE id = "${req.params.id}";`, function (err, result) {
                if (err) res.status(500).json({ msg: "Internal server error" });
                if (result.affectedRows != 0)
                    res.status(200).json({ msg: `Successfully deleted record number: ${req.params.id}` });
                else
                    res.status(200).json({ msg: "Not found"});
            });
        } else if (!res.headersSent) {
            res.status(403).json({ msg: "Authorization denied" });
        }
    });
}
