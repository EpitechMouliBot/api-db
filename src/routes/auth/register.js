import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as glob from "../../global.js";
import * as log from "nodejs-log-utils";

function checkEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function checkPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(password)
}

function error_handling_register(req) {
    if (!req.body.hasOwnProperty('email')) {
        return false;
    }
    if (!req.body.hasOwnProperty('password')) {
        return false;
    }
    if (!req.body.hasOwnProperty('cookies')) {
        return false;
    }
    if (!checkEmail(req.body.email) || !checkPassword(req.body.password))
        return false;
    return true;
}

export default async function(app, con) {
    app.post("/register", async (req, res) => {
        if (!error_handling_register(req)) {
            res.status(400).json({ msg: "Bad parameter" });
            return;
        }
        const passwordHash = bcrypt.hashSync(req.body['password']);
        const cookiesHash = glob.encryptString(req.body['cookies']);
        con.query(`SELECT * FROM user WHERE email = "${req.body.email}";`, function (err, rows) {
            if (err) {
                res.status(500).json({ msg: "Internal server error" });
                log.error("Internal server error");
                log.debug(err, false);
            } else if (rows[0] !== undefined)
                res.status(418).json({ msg: "Account already exists" });
            else {
                con.query(`INSERT INTO user(email, password, cookies) VALUES("${req.body["email"]}", "${passwordHash}", '${cookiesHash}')`, function (err2, result) {
                    if (err2) {
                        res.status(500).json({ msg: "Internal server error" });
                        log.error("Internal server error");
                        log.debug(err2, false);
                    } else {
                        con.query(`SELECT * FROM user WHERE email = "${req.body.email}";`, function (err3, rows) {
                            if (err3) {
                                res.status(500).json({ msg: "Internal server error" });
                                log.error("Internal server error");
                                log.debug(err3, false);
                            } else if (rows !== undefined && rows[0] !== undefined) {
                                let token = jwt.sign({ id: `${rows[0].id}` }, process.env.SECRET, { expiresIn: '40w' });
                                res.status(201).json({token: token, id: rows[0].id});
                            } else
                                res.sendStatus(404);
                        });
                    }
                });
            }
        });
    });
}
