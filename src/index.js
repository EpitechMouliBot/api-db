const express = require('express');
var glob = require('./global');

glob.app.use(glob.bodyParser.urlencoded({ extended: false }));
glob.app.use(glob.bodyParser.json());
glob.app.use(express.json());

glob.con.connect(function(err) {
    if (err) throw new Error(`Failed to connect to database ${glob.myenv.MYSQL_DATABASE}`);
    console.log("Connecté à la base de données " + glob.myenv.MYSQL_DATABASE);
});

glob.app.get("/", (req, res) => {
    res.send("MouliBot API");
});

require('./routes/auth/register.js')(glob.app, glob.con);
require('./routes/auth/login.js')(glob.app, glob.con);

require('./routes/user/user.js')(glob.app, glob.con);
require('./routes/user/user_id.js')(glob.app, glob.con);

glob.app.listen(glob.port, () => {
    console.log(`App listening at http://localhost:${glob.port}`);
});
