var glob = require('../../global');

const SECRET = glob.myenv.SECRET;

module.exports = async function(app, con) {
    app.get("/user", glob.verifyToken, async (req, res) => {
        if (glob.verifyAuth(req, res, false)) {
            con.query(`SELECT * FROM user;`, function (err2, rows) {
                if (err2) res.status(500).json({ msg: "Internal server error" });
                res.send(rows);
            });
        } else if (!res.headersSent) {
            res.status(403).json({ msg: "Authorization denied" });
        }
    });
}
