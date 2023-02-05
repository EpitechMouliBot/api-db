import express from "express";
import bodyParser from "body-parser";
import * as glob from "./global.js";
import * as log from "nodejs-log-utils";

log.resetLogFile();

glob.app.use(bodyParser.urlencoded({ extended: false }));
glob.app.use(bodyParser.json());
glob.app.use(express.json());

glob.con.connect(function(err) {
    if (err) throw new Error(`Failed to connect to database ${process.env.MYSQL_DATABASE}`);
    log.success("Connecté à la base de données " + process.env.MYSQL_DATABASE);
});

glob.app.get("/", (req, res) => {
    res.send("MouliBot API");
});

import routeRegister from './routes/auth/register.js';
import routeLogin from './routes/auth/login.js';

import routeUser from './routes/user/user.js';
import routeUserId from './routes/user/user_id.js';

routeRegister(glob.app, glob.con);
routeLogin(glob.app, glob.con);

routeUser(glob.app, glob.con);
routeUserId(glob.app, glob.con);

glob.app.listen(process.env.PORT, process.env.HOST_NAME, () => {
    log.success(`App listening at http://${process.env.HOST_NAME}:${process.env.PORT}`);
});
