var glob = require('../../global');

const SECRET = glob.myenv.SECRET;

function get_id_with_token(req, res) {
    try {
        var decoded = glob.jwt.verify(req.token, SECRET);
        return (decoded.id);
    } catch (err) {
        res.status(403).json({ msg: "Token is not valid" });
    }
    return (-1);
}

module.exports = async function(app, con) {
    app.get("/user", glob.verifyToken, async (req, res) => {
        con.query(`SELECT * FROM user;`, function (err2, rows) {
            if (err2) res.status(500).json({ msg: "Internal server error" });
            res.send(rows);
        });
    });
}
