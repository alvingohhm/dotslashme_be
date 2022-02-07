const { Sequelize } = require("sequelize");
const config = require("../config");
const { Pool } = require("pg");

const db = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
  }
);

const pool = new Pool({
  user: config.db.username,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

module.exports = {
  db,
  pool,
};
