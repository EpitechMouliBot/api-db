import dotenv from "dotenv";
import express from "express";
import mysql from "mysql2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import * as log from 'nodejs-log-utils';

dotenv.config();

export const app = express();
export const con = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});
const algorithm = 'aes-256-cbc';

export function encryptString(text) {
    const iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(process.env.SECRET, 'utf8'), iv);
    return JSON.stringify({ i: iv.toString('hex'), e: Buffer.concat([cipher.update(text), cipher.final()]).toString('hex') });
}

export function decryptString(text) {
    text = JSON.parse(text);
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(process.env.SECRET, 'utf8'), Buffer.from(text.i, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(text.e, 'hex')), decipher.final()]).toString();
}

export function decryptAllCookies(rows) {
    rows.forEach((element) => {
        if (element.cookies)
            element.cookies = decryptString(element.cookies);
    });
}

export function verifyToken(req, res, next) {
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
            let decoded = jwt.verify(req.token, process.env.SECRET);
            con.query(`SELECT id FROM user WHERE id = "${decoded.id}";`, function (err2, rows) {
                if (err2) {
                    res.status(500).json({ msg: "Internal server error" });
                    log.error("Internal server error");
                    log.debug(err2, false);
                } else if (rows[0] && rows[0].id == decoded.id)
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

export function get_id_with_token(req, res) {
    try {
        let decoded = jwt.verify(req.token, process.env.SECRET);
        return (decoded.id);
    } catch (err) {
        res.status(403).json({ msg: "Token is not valid" });
    }
    return (-1);
}

export function verifyAuth(req, res, verifId) {
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

export function is_num(id) {
    return (/^\d+$/.test(id));
}
