const { User, Profile, Summary, Skill, Showcase } = require("../db/models");
const jsonMessages = require("../utils/jsonMessages");

const userController = {
  getSessionUser: async (req) => {
    const { id } = req.session.user || {};
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

    return user;
  },

  updateProfile: async (req, res) => {
    try {
      const user = await userController.getSessionUser(req);
      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      //update user first than proceed to profile
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
        //if no profile exist create it instead of update
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
        //i fprofile exist update instead
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
    try {
      const { id } = req.session.user || {};
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
        .status(200)
        .json(jsonMessages(200, "yes", "Get profile successfully", data));
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to get profile", []));
    }
  },

  updateSummary: async (req, res) => {
    try {
      const user = await userController.getSessionUser(req);
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
    try {
      const { id } = req.session.user || {};
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
        .status(200)
        .json(jsonMessages(200, "yes", "Get summary successfully", data));
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to get summary", []));
    }
  },

  createSkill: async (req, res) => {
    try {
      const user = await userController.getSessionUser(req);
      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      let skillNames = (
        await user.getSkills({
          where: { is_main: true },
          attributes: ["skill_name"],
          raw: true,
        })
      ).map((skill) => skill.skill_name);

      if (skillNames.includes(req.body.skill_name)) {
        return res
          .status(400)
          .json(jsonMessages(400, "no", "Skill already exist", []));
      }

      req.body.is_main = true;
      req.body.tags = ["default"];

      const newSkill = await user.createSkill(req.body);
      const { createdAt, updatedAt, is_main, user_id, ...finalResult } =
        newSkill.toJSON();

      return res
        .status(201)
        .json(jsonMessages(201, "yes", "Profile created", [finalResult]));
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to create skill", []));
    }
  },

  getSkills: async (req, res) => {
    try {
      const user = await userController.getSessionUser(req);
      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      let skills = await user.getSkills({
        where: { is_main: true },
        attributes: ["id", "skill_name"],
        raw: true,
      });

      const data = [skills];
      return res
        .status(200)
        .json(jsonMessages(200, "yes", "Get skills successfully", data));
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to get skills", []));
    }
  },

  getOneSkill: async (req, res) => {
    try {
      const { id } = req.params;
      const skill = await Skill.findByPk(id, {
        attributes: ["id", "skill_name"],
      });

      if (!skill) {
        return res
          .status(400)
          .json(jsonMessages(400, "no", "skill not found", []));
      }

      const data = [skill.toJSON()];
      return res
        .status(200)
        .json(jsonMessages(200, "yes", "Get skill successfully", data));
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to get skill", []));
    }
  },

  updateSkill: async (req, res) => {
    try {
      const { id } = req.params;
      const skill = await Skill.findByPk(id, {
        attributes: ["id", "skill_name"],
      });

      if (!skill) {
        return res
          .status(400)
          .json(jsonMessages(400, "no", "skill not found", []));
      }

      skill.set(req.body);
      await skill
        .save()
        .then((updatedSkill) => {
          const data = [updatedSkill.toJSON()];
          return res
            .status(200)
            .json(jsonMessages(200, "yes", "Update skill successfully", data));
        })
        .catch((error) => {
          console.log(error);
          return res
            .status(400)
            .json(
              jsonMessages(400, "no", "Unable to update skill successfully", [])
            );
        });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to update skill", []));
    }
  },

  createShowcase: async (req, res) => {
    try {
      const user = await userController.getSessionUser(req);
      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      req.body.identifier = "Default Showcase";
      req.body.is_main = true;
      req.body.tags = ["default"];

      console.log(req.body);

      const newShowcase = await user.createShowcase(req.body);
      const { createdAt, updatedAt, is_main, user_id, ...finalResult } =
        newShowcase.toJSON();

      return res
        .status(201)
        .json(jsonMessages(201, "yes", "Showcase created", [finalResult]));
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to create showcase", []));
    }
  },

  getShowcases: async (req, res) => {
    try {
      const user = await userController.getSessionUser(req);
      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      let showcases = await user.getShowcases({
        where: { is_main: true },
        attributes: ["id", "url", "description"],
        raw: true,
      });

      const data = [showcases];
      return res
        .status(200)
        .json(jsonMessages(200, "yes", "Get showcases successfully", data));
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to get showcases", []));
    }
  },

  getOneShowcase: async (req, res) => {
    try {
      const { id } = req.params;
      const showcase = await Showcase.findByPk(id, {
        attributes: ["id", "url", "description"],
      });

      if (!showcase) {
        return res
          .status(400)
          .json(jsonMessages(400, "no", "showcase not found", []));
      }

      const data = [showcase.toJSON()];
      return res
        .status(200)
        .json(jsonMessages(200, "yes", "Get showcase successfully", data));
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to get showcase", []));
    }
  },

  updateShowcase: async (req, res) => {
    try {
      const { id } = req.params;
      const showcase = await Showcase.findByPk(id, {
        attributes: ["id", "url", "description"],
      });

      if (!showcase) {
        return res
          .status(400)
          .json(jsonMessages(400, "no", "showcase not found", []));
      }

      showcase.set(req.body);
      await showcase
        .save()
        .then((updatedShowcase) => {
          const data = [updatedShowcase.toJSON()];
          return res
            .status(200)
            .json(
              jsonMessages(200, "yes", "Update showcase successfully", data)
            );
        })
        .catch((error) => {
          console.log(error);
          return res
            .status(400)
            .json(
              jsonMessages(
                400,
                "no",
                "Unable to update showcase successfully",
                []
              )
            );
        });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to update showcase", []));
    }
  },
};

module.exports = userController;
