const { Model } = require("sequelize");
const useBcrypt = require("sequelize-bcrypt");

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
      models.Profile.belongsTo(User);

      //1 to many between user and education
      User.hasMany(models.Education, {
        onDelete: "CASCADE",
        foreignKey: {
          name: "user_id",
          type: DataTypes.UUID,
          allowNull: false,
        },
      });
      models.Education.belongsTo(User);
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
      firstName: {
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
  useBcrypt(User, {
    field: "password", // secret field to hash, default: 'password'
    rounds: 12, // used to generate bcrypt salt, default: 12
    compare: "authenticate", // method used to compare secrets, default: 'authenticate'
  });
  return User;
};
