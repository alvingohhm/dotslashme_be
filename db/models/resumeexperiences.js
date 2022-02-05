const { Model } = require("sequelize");

module.exports = (db, DataTypes) => {
  class ResumeExperiences extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      ResumeExperiences.belongsTo(models.Resume, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "resume_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      ResumeExperiences.belongsTo(models.Experience, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "experience_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });
    }
  }
  ResumeExperiences.init(
    {
      resume_id: DataTypes.UUID,
      experience_id: DataTypes.UUID,
    },
    {
      sequelize: db,
      modelName: "ResumeExperiences",
      timestamps: false,
    }
  );
  return ResumeExperiences;
};
