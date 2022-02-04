const { Model } = require("sequelize");

module.exports = (db, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Profile.init(
    {
      profile_img: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      street_address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      postal: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      linkedin_account: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
    },
    {
      sequelize: db,
      modelName: "Profile",
      timestamps: true,
    }
  );
  return Profile;
};
