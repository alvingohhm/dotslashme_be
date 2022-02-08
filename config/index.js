const dotenv = require("dotenv");
const env = process.env.NODE_ENV || "development";

//set different dotenv path base on which node environment
if (env === "development") {
  dotenv.config({ path: "config/.env.development" });
}

const baseConfig = {
  env,
  port: process.env.PORT,
  db: {
    database: process.env.DB,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PWD,
    host: "127.0.0.1",
    dialect: "postgres",
    port: 5432,
  },
  secrets: {
    sessions: process.env.JWT_SECRET,
    jwt: process.env.JWT_SECRET,
    refresh: process.env.REFRESH_TOKEN_SECRET,
    jwtExp: "30d",
    refreshExp: "100d",
  },
};

module.exports = baseConfig;
