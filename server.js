const express = require("express");
const cors = require("cors");
const config = require("./config");
const db = require("./db/dbConnect");
const { User } = require("./db/models");
const { authController } = require("./controllers");
//////////////////////////////////
// initialize
//////////////////////////////////
const app = express();
////////////////////////////////////
// Middleware
////////////////////////////////////
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
//////////////////////////////////
// Login and Signup
//////////////////////////////////
app.get("/", (req, res) => {
  res.status(400).json();
});

app.post("/signup", authController.signup_handler);
app.post("/login", authController.login_handler);
// app.post("/test", authController.protect);

app.use("/api/users");

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
