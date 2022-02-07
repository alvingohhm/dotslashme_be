const { User, Profile } = require("../db/models");
const jsonMessages = require("../utils/jsonMessages");

const userController = {
  updateProfile: async (req, res) => {
    const { id } = req.session.user || {};

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }
      console.log("before getProfile");
      let profile = await user.getProfile();
      if (!profile) {
        console.log("in getProfile");

        profile = await user.createProfile(req.body);
        const data = [profile.toJSON()];
        return res
          .status(201)
          .json(jsonMessages(201, "yes", "Profile created", data));
      } else {
        //update instead
        profile.set(req.body);
        await profile
          .save()
          .then((data) => {
            return res
              .status(201)
              .json(jsonMessages(201, "yes", "Profile updated", data));
          })
          .catch((error) => {
            console.log(error);
            return res
              .status(400)
              .json(jsonMessages(400, "no", "Unable to update profile", []));
          });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to create profile", []));
    }
  },
};

module.exports = userController;
