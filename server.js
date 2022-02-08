const express = require("express");
const cors = require("cors");
const config = require("./config");
const { db, pool } = require("./db/dbConnect");
const expressSession = require("express-session");
const pgSession = require("connect-pg-simple")(expressSession);
const { userRouter } = require("./routers");
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
//middleware for session
app.use(
  expressSession({
    store: new pgSession({
      pool: pool, // Connection pool
      createTableIfMissing: true,
    }),
    secret: config.secrets.sessions,
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    // Insert express-session options here
  })
);
//////////////////////////////////////////////////
// Login, Signup, Logout and Refresh Jwt Token
//////////////////////////////////////////////////
app.post("/signup", authController.signup_handler);
app.post("/login", authController.login_handler);
app.delete("/logout", authController.logout_handler);
app.post("/refresh", authController.refreshToken_handler);

//////////////////////////////////////////////////
// Resource Routes
//////////////////////////////////////////////////
app.use("/api", authController.protect);
app.use("/api/users", userRouter);

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
