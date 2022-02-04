const { DataTypes } = require("sequelize");
const Sequelize = require("sequelize");
const db = require("../dbConnect");

const models = {
  User: require("./user")(db, DataTypes),
  Profile: require("./profile")(db, DataTypes),
};

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = db;
models.Sequelize = Sequelize;

module.exports = models;
