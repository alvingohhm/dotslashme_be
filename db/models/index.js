const { DataTypes } = require("sequelize");
const Sequelize = require("sequelize");
const { db } = require("../dbConnect");

const models = {
  User: require("./user")(db, DataTypes),
  Profile: require("./profile")(db, DataTypes),
  Summary: require("./summary")(db, DataTypes),
  Experience: require("./experience")(db, DataTypes),
  Education: require("./education")(db, DataTypes),
  Showcase: require("./showcase")(db, DataTypes),
  Skill: require("./skill")(db, DataTypes),
  ResumeShowcases: require("./resumeshowcases")(db, DataTypes),
  ResumeSkills: require("./resumeskills")(db, DataTypes),
  ResumeExperiences: require("./resumeexperiences")(db, DataTypes),
  ResumeEducation: require("./resumeeducation")(db, DataTypes),
  Resume: require("./resume")(db, DataTypes),
};

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = db;
models.Sequelize = Sequelize;

module.exports = models;
