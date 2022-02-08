const { User, Profile, Summary } = require("../db/models");
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

      //update user
      user.set({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
      });
      await user.save().catch((error) => {
        console.log(error);
        return res
          .status(400)
          .json(jsonMessages(400, "no", "Unable to update profile", []));
      });

      //update profile section
      let profile = await user.getProfile();

      if (!profile) {
        profile = await user.createProfile(req.body.Profile);

        const finalResult = {
          first_name: user.first_name,
          last_name: user.last_name,
        };
        const { id, createdAt, updatedAt, user_id, ...updatedProfile } =
          profile.toJSON();
        finalResult.Profile = updatedProfile;

        return res
          .status(201)
          .json(jsonMessages(201, "yes", "Profile created", [finalResult]));
      } else {
        //update instead
        profile.set(req.body.Profile);
        await profile
          .save()
          .then((data) => {
            const finalResult = {
              first_name: user.first_name,
              last_name: user.last_name,
            };
            const { id, createdAt, updatedAt, user_id, ...updatedProfile } =
              data.toJSON();
            finalResult.Profile = updatedProfile;

            return res
              .status(201)
              .json(jsonMessages(201, "yes", "Profile updated", [finalResult]));
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

  getProfile: async (req, res) => {
    const { id } = req.session.user || {};

    try {
      const user = await User.findByPk(id, {
        attributes: {
          exclude: [
            "password",
            "activation_token",
            "is_activated",
            "createdAt",
            "updatedAt",
          ],
        },
        include: [
          {
            model: Profile,
            attributes: {
              exclude: ["createdAt", "updatedAt", "user_id"],
            },
          },
        ],
      });

      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      const data = [user.toJSON()];

      return res
        .status(201)
        .json(jsonMessages(200, "yes", "Get profile successfully", data));
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to get profile", []));
    }
  },

  updateSummary: async (req, res) => {
    const { id } = req.session.user || {};
    try {
      const user = await User.findByPk(id, {
        attributes: {
          exclude: [
            "password",
            "activation_token",
            "is_activated",
            "createdAt",
            "updatedAt",
          ],
        },
      });
      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      let summaries = await user.getSummaries({ where: { is_main: true } });

      if (Array.isArray(summaries)) {
        //set the body with the default value
        req.body.identifier = "Default Summary";
        req.body.is_main = true;
        req.body.tags = ["default"];

        if (summaries.length === 0) {
          // create summary if there isn't a record
          newSummary = await user.createSummary(req.body);

          const { id, createdAt, updatedAt, is_main, user_id, ...finalResult } =
            newSummary.toJSON();

          return res
            .status(201)
            .json(jsonMessages(201, "yes", "Profile created", [finalResult]));
        } else {
          // update summary instead
          const summary = summaries[0];
          summary.set(req.body);
          await summary
            .save()
            .then((data) => {
              const {
                id,
                createdAt,
                updatedAt,
                is_main,
                user_id,
                ...finalResult
              } = data.toJSON();
              return res
                .status(201)
                .json(
                  jsonMessages(201, "yes", "Profile updated", [finalResult])
                );
            })
            .catch((error) => {
              console.log(error);
              return res
                .status(400)
                .json(jsonMessages(400, "no", "Unable to update profile", []));
            });
        }
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to create summary", []));
    }
  },

  getSummary: async (req, res) => {
    const { id } = req.session.user || {};

    try {
      const user = await User.findByPk(id, {
        attributes: {
          exclude: [
            "password",
            "activation_token",
            "is_activated",
            "createdAt",
            "updatedAt",
          ],
        },
        include: [
          {
            model: Summary,
            where: { is_main: true },
            attributes: {
              exclude: ["createdAt", "updatedAt", "user_id"],
            },
          },
        ],
      });

      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      const data = [user.toJSON()];

      return res
        .status(201)
        .json(jsonMessages(200, "yes", "Get summary successfully", data));
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to get summary", []));
    }
  },
};

module.exports = userController;
