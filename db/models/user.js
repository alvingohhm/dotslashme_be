const { Model } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (db, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //1 to 1 between user and profile
      User.hasOne(models.Profile, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "user_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      //1 to many between user and education
      User.hasMany(models.Education, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "user_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      //1 to many between user and experience
      User.hasMany(models.Experience, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "user_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      //1 to many between user and showcase
      User.hasMany(models.Showcase, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "user_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      //1 to many between user and skill
      User.hasMany(models.Skill, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "user_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      //1 to many between user and summary
      User.hasMany(models.Summary, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "user_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });

      //1 to many between user and resume
      User.hasMany(models.Resume, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "user_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });
    }

    static async hashValue(payload) {
      return await bcrypt.hash(payload, 12);
    }

    async authenticate(pwd) {
      return await bcrypt.compare(pwd, this.password);
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: "email address format not valid" },
        },
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      activation_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_activated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize: db,
      modelName: "User",
      timestamps: true,
    }
  );

  User.beforeCreate(async (user) => {
    if (user.password) {
      const hashedPassword = await User.hashValue(user.password);
      user.password = hashedPassword;
    }
    if (user.email) {
      user.email = user.email.toLowerCase();
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed("password")) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      user.password = hashedPassword;
    }
  });

  return User;
};
