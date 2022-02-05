const { Model } = require("sequelize");

module.exports = (db, DataTypes) => {
  class ResumeEducation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      ResumeEducation.belongsTo(models.Resume, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "resume_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      ResumeEducation.belongsTo(models.Education, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "education_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });
    }
  }
  ResumeEducation.init(
    {
      resume_id: DataTypes.UUID,
      education_id: DataTypes.UUID,
    },
    {
      sequelize: db,
      modelName: "ResumeEducation",
      timestamps: false,
    }
  );
  return ResumeEducation;
};
