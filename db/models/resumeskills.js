const { Model } = require("sequelize");

module.exports = (db, DataTypes) => {
  class ResumeSkills extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      ResumeSkills.belongsTo(models.Resume, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "resume_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      ResumeSkills.belongsTo(models.Skill, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "skill_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });
    }
  }
  ResumeSkills.init(
    {
      resume_id: DataTypes.UUID,
      skill_id: DataTypes.UUID,
    },
    {
      sequelize: db,
      modelName: "ResumeSkills",
      timestamps: false,
    }
  );
  return ResumeSkills;
};
