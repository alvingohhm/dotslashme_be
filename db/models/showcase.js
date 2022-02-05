const { Model } = require("sequelize");

module.exports = (db, DataTypes) => {
  class Showcase extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Showcase.init(
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
        set(value) {
          if (!value || value.length === 0) {
            this.setDataValue("identifier", `Showcase_${this.id}`);
          }
        },
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
    },
    {
      sequelize: db,
      modelName: "Showcase",
      timestamps: true,
    }
  );
  return Showcase;
};
