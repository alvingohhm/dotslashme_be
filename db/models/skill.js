const { Model } = require("sequelize");

module.exports = (db, DataTypes) => {
  class Skill extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //1 to many between user and skill
      Skill.belongsTo(models.User);

      //many to many between resume and skill through ResumeSkills
      Skill.belongsToMany(models.Resume, {
        through: models.ResumeSkills,
        onDelete: "CASCADE",
        foreignKey: {
          name: "skill_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });
    }
  }
  Skill.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      skill_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
    },
    {
      sequelize: db,
      modelName: "Skill",
      timestamps: true,
    }
  );
  return Skill;
};
