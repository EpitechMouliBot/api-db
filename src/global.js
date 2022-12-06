const dotenv = require('dotenv');
const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

dotenv.config();

const SECRET = process.env.SECRET;
const app = express();
const port = process.env.PORT;
const con = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof(bearerHeader) !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;

        if (req.token === process.env.OTHER_APP_TOKEN) {
            next();
            return;
        }
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

function get_id_with_token(req, res) {
    try {
        var decoded = jwt.verify(req.token, SECRET);
        return (decoded.id);
    } catch (err) {
        res.status(403).json({ msg: "Token is not valid" });
    }
    return (-1);
}

function verifyAuth(req, res, verifId) {
    if (req.token === process.env.OTHER_APP_TOKEN)
        return true;

    if (verifId) {
        let token_id = get_id_with_token(req, res);
        if (token_id === -1)
            return false;
        return token_id === req.params.id;
    }
    return false;
}

function is_num(id) {
    return (/^\d+$/.test(id));
}

exports.app = app;
exports.port = port;
exports.con = con;
exports.verifyToken = verifyToken;
exports.verifyAuth = verifyAuth
exports.is_num = is_num;
