const express = require("express");
const config = require("./config");
const db = require("./db/dbConnect");
//////////////////////////////////
// initialize
//////////////////////////////////
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//////////////////////////////////
// listening
//////////////////////////////////
app.listen(config.port, () => {
  db.authenticate()
    .then(() => {
      console.log(`  🌞 Database connected...`);
    })
    .catch((err) => console.log(err));
  console.log(`
  ⚡  Using Environment = ${config.env}
  🚀  Server is running
  🔉  Listening on port ${config.port}
`);
});
