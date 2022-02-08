const { Model } = require("sequelize");

module.exports = (db, DataTypes) => {
  class Resume extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //1 to many between user and resume
      Resume.belongsTo(models.User, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "user_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      //1 to many between summary and resuem
      Resume.belongsTo(models.Summary, {
        onDelete: "SET NULL",
        foreignKey: {
          name: "summary_id",
          type: DataTypes.UUID,
          allowNull: true,
        },
      });

      //many to many between resume and showcase through ResumeShowcases
      Resume.belongsToMany(models.Showcase, {
        through: models.ResumeShowcases,
        onDelete: "CASCADE",
        foreignKey: {
          name: "resume_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      //many to many between resume and skill through ResumeSkills
      Resume.belongsToMany(models.Skill, {
        through: models.ResumeSkills,
        onDelete: "CASCADE",
        foreignKey: {
          name: "resume_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      //many to many between resume and experience through ResumeExperiences
      Resume.belongsToMany(models.Experience, {
        through: models.ResumeExperiences,
        onDelete: "CASCADE",
        foreignKey: {
          name: "resume_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      //many to many between resume and education through ResumeEducation
      Resume.belongsToMany(models.Education, {
        through: models.ResumeEducation,
        onDelete: "CASCADE",
        foreignKey: {
          name: "resume_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });
    }
  }
  Resume.init(
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
      has_phone: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      has_address: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      has_socialmedia: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      job_tags: {
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
      modelName: "Resume",
      timestamps: true,
    }
  );
  return Resume;
};
