const express = require('express');
const bodyParser = require("body-parser");
const glob = require('./global');

glob.app.use(bodyParser.urlencoded({ extended: false }));
glob.app.use(bodyParser.json());
glob.app.use(express.json());

glob.con.connect(function(err) {
    if (err) throw new Error(`Failed to connect to database ${process.env.MYSQL_DATABASE}`);
    console.log("Connecté à la base de données " + process.env.MYSQL_DATABASE);
});

glob.app.get("/", (req, res) => {
    res.send("MouliBot API");
});

require('./routes/auth/register.js')(glob.app, glob.con);
require('./routes/auth/login.js')(glob.app, glob.con);

require('./routes/user/user.js')(glob.app, glob.con);
require('./routes/user/user_id.js')(glob.app, glob.con);

glob.app.listen(process.env.PORT, process.env.HOST_NAME, () => {
    console.log(`App listening at http://${process.env.HOST_NAME}:${process.env.PORT}`);
});
