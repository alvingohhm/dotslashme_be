const { Model } = require("sequelize");

module.exports = (db, DataTypes) => {
  class ResumeShowcases extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      ResumeShowcases.belongsTo(models.Resume, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "resume_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      ResumeShowcases.belongsTo(models.Showcase, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "showcase_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });
    }
  }
  ResumeShowcases.init(
    {
      resume_id: DataTypes.UUID,
      showcase_id: DataTypes.UUID,
    },
    {
      sequelize: db,
      modelName: "ResumeShowcases",
      timestamps: false,
    }
  );
  return ResumeShowcases;
};
