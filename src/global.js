/*          dependencies            */
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const express = require("express");
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/*          my consts               */
const env_conf = dotenv.config();
if (env_conf.error) {
    throw env_conf.error;
}
const myenv = env_conf.parsed;
const SECRET = myenv.SECRET;
const app = express();
const port = myenv.PORT;
const con = mysql.createConnection({
    host: myenv.MYSQL_HOST,
    user: myenv.MYSQL_USER,
    password: myenv.MYSQL_PASSWORD,
    database: myenv.MYSQL_DATABASE
});

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof(bearerHeader) !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        try {
            var decoded = jwt.verify(req.token, SECRET);
            con.query(`SELECT id FROM user WHERE id = "${decoded.id}";`, function (err2, rows) {
                if (err2) res.status(500).json({ msg: "Internal server error" });
                if (rows[0] && rows[0].id == decoded.id)
                    next();
                else
                    res.status(403).json({ msg: "Token is not valid" });
            });
        } catch (err) {
            res.status(403).json({ msg: "Token is not valid" });
        }
    } else {
        res.status(403).json({ msg: "No token, authorization denied" });
    }
}

function is_num(id) {
    return (/^\d+$/.test(id));
}

exports.bodyParser = bodyParser;
exports.myenv = myenv;
exports.app = app;
exports.port = port;
exports.con = con;
exports.bcrypt = bcrypt;
exports.mysql = mysql;
exports.jwt = jwt;
exports.verifyToken = verifyToken;
exports.is_num = is_num;