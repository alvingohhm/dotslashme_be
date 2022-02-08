const { Model } = require("sequelize");

module.exports = (db, DataTypes) => {
  class Summary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //1 to many between user and summary
      Summary.belongsTo(models.User, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "user_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      //1 to many between summary and resuem
      Summary.hasMany(models.Resume, {
        onDelete: "SET NULL",
        foreignKey: {
          name: "summary_id",
          type: DataTypes.UUID,
          allowNull: true,
        },
      });
    }
  }
  Summary.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      identifier: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      headline: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      prof_summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      is_main: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize: db,
      modelName: "Summary",
      timestamps: true,
    }
  );
  return Summary;
};
