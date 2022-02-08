const { Model } = require("sequelize");

module.exports = (db, DataTypes) => {
  class Education extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //1 to many between user and education
      Education.belongsTo(models.User, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "user_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      //many to many between resume and education through ResumeEducation
      Education.belongsToMany(models.Resume, {
        through: models.ResumeEducation,
        onDelete: "CASCADE",
        foreignKey: {
          name: "education_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });
    }
  }
  Education.init(
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
      start_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      school: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      degree: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      field_of_study: {
        type: DataTypes.STRING,
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
      modelName: "Education",
      timestamps: true,
    }
  );
  return Education;
};
