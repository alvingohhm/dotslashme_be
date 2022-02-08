const {
  User,
  Profile,
  Skill,
  Showcase,
  Education,
  Experience,
} = require("../db/models");
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
      //create default resume instance

      const resumes = await user.getResumes({ where: { is_main: true } });
      const resume = resumes[0];

      let summaries = await user.getSummaries({ where: { is_main: true } });

      if (Array.isArray(summaries)) {
        //set the body with the default value
        req.body.identifier = "Default Summary";
        req.body.is_main = true;
        req.body.tags = ["default"];

        if (summaries.length === 0) {
          // create summary if there isn't a record
          newSummary = await user.createSummary(req.body);

          await resume.setSummary(newSummary).catch((err) => {
            return res
              .status(400)
              .json(
                jsonMessages(
                  400,
                  "no",
                  "unable to associate resume with summary"
                ),
                []
              );
          });

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
      const user = await userController.getSessionUser(req);
      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      let summaries = await user.getSummaries({
        where: { is_main: true },
        attributes: {
          exclude: ["createdAt", "updatedAt", "user_id", "is_main"],
        },
        raw: true,
      });

      let data;
      if (summaries.length === 1) {
        data = summaries;
      } else if (summaries.length === 0) {
        data = [];
      } else {
        data = [summaries[0]];
      }

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

      //create default resume instance
      const resumes = await user.getResumes({ where: { is_main: true } });
      const resume = resumes[0];

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

      await resume.addSkill(newSkill).catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json(
            jsonMessages(400, "no", "unable to associate resume with skill"),
            []
          );
      });

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

  removeSkill: async (req, res) => {
    try {
      const { id } = req.params;
      const skill = await Skill.findByPk(id);

      if (!skill) {
        return res
          .status(400)
          .json(jsonMessages(400, "no", "skill not found", []));
      }

      skill
        .destroy()
        .then(() => {
          return res
            .status(200)
            .json(jsonMessages(200, "yes", "Skill remove successfully", []));
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(400)
            .json(jsonMessages(400, "no", "Unable to remove skill", []));
        });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to remove skill", []));
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

      //create default resume instance
      const resumes = await user.getResumes({ where: { is_main: true } });
      const resume = resumes[0];

      req.body.identifier = "Default Showcase";
      req.body.is_main = true;
      req.body.tags = ["default"];

      const newShowcase = await user.createShowcase(req.body);

      const { createdAt, updatedAt, is_main, user_id, ...finalResult } =
        newShowcase.toJSON();

      await resume.addShowcase(newShowcase).catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json(
            jsonMessages(400, "no", "unable to associate showcase with skill"),
            []
          );
      });

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

  removeShowcase: async (req, res) => {
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

      showcase
        .destroy()
        .then(() => {
          return res
            .status(200)
            .json(jsonMessages(200, "yes", "Showcase remove successfully", []));
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(400)
            .json(jsonMessages(400, "no", "Unable to remove showcase", []));
        });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to remove showcase", []));
    }
  },

  createEducation: async (req, res) => {
    try {
      const user = await userController.getSessionUser(req);
      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      //create default resume instance
      const resumes = await user.getResumes({ where: { is_main: true } });
      const resume = resumes[0];

      req.body.identifier = "Default Education";
      req.body.is_main = true;
      req.body.tags = ["default"];

      const newEducation = await user.createEducation(req.body);

      const { createdAt, updatedAt, is_main, user_id, ...finalResult } =
        newEducation.toJSON();

      await resume.addEducation(newEducation).catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json(
            jsonMessages(
              400,
              "no",
              "unable to associate resume with education"
            ),
            []
          );
      });

      return res
        .status(201)
        .json(
          jsonMessages(201, "yes", "Education details created", [finalResult])
        );
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(
          jsonMessages(500, "no", "Unable to create education details", [])
        );
    }
  },

  getEducation: async (req, res) => {
    try {
      const user = await userController.getSessionUser(req);
      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      let education = await user.getEducation({
        where: { is_main: true },
        attributes: {
          exclude: ["tags", "is_main", "createdAt", "updatedAt"],
        },
        order: [["end_date", "DESC"]],
        raw: true,
      });

      const data = [education];
      return res
        .status(200)
        .json(
          jsonMessages(
            200,
            "yes",
            "Get series of education details successfully",
            data
          )
        );
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(
          jsonMessages(
            500,
            "no",
            "Unable to get series of education details",
            []
          )
        );
    }
  },

  getOneEducation: async (req, res) => {
    try {
      const { id } = req.params;
      const education = await Education.findByPk(id, {
        attributes: {
          exclude: ["tags", "is_main", "createdAt", "updatedAt"],
        },
      });

      if (!education) {
        return res
          .status(400)
          .json(jsonMessages(400, "no", "Education details not found", []));
      }

      const data = [education.toJSON()];
      return res
        .status(200)
        .json(
          jsonMessages(200, "yes", "Get education details successfully", data)
        );
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to get education details", []));
    }
  },

  updateEducation: async (req, res) => {
    try {
      const { id } = req.params;
      const education = await Education.findByPk(id, {
        attributes: {
          exclude: ["tags", "is_main", "createdAt", "updatedAt"],
        },
      });

      if (!education) {
        return res
          .status(400)
          .json(jsonMessages(400, "no", "Education details not found", []));
      }

      education.set(req.body);
      await education
        .save()
        .then((updatedEducation) => {
          const data = [updatedEducation.toJSON()];
          return res
            .status(200)
            .json(
              jsonMessages(
                200,
                "yes",
                "Update education details successfully",
                data
              )
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
                "Unable to update education details successfully",
                []
              )
            );
        });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(
          jsonMessages(500, "no", "Unable to update education details", [])
        );
    }
  },

  removeEducation: async (req, res) => {
    try {
      const { id } = req.params;
      const education = await Education.findByPk(id, {
        attributes: {
          exclude: ["tags", "is_main", "createdAt", "updatedAt"],
        },
      });

      if (!education) {
        return res
          .status(400)
          .json(jsonMessages(400, "no", "Education details not found", []));
      }

      education
        .destroy()
        .then(() => {
          return res
            .status(200)
            .json(
              jsonMessages(
                200,
                "yes",
                "Education details remove successfully",
                []
              )
            );
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(400)
            .json(
              jsonMessages(400, "no", "Unable to remove education details", [])
            );
        });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(
          jsonMessages(500, "no", "Unable to remove education details", [])
        );
    }
  },

  createExperience: async (req, res) => {
    try {
      const user = await userController.getSessionUser(req);
      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      req.body.identifier = "Default Experience";
      req.body.is_main = true;
      req.body.tags = ["default"];

      console.log(req.body);

      const newExperience = await user.createExperience(req.body);
      const { createdAt, updatedAt, is_main, user_id, ...finalResult } =
        newExperience.toJSON();

      return res
        .status(201)
        .json(
          jsonMessages(201, "yes", "Experience details created", [finalResult])
        );
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(
          jsonMessages(500, "no", "Unable to create Experience details", [])
        );
    }
  },

  getExperiences: async (req, res) => {
    try {
      const user = await userController.getSessionUser(req);
      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      let experience = await user.getExperiences({
        where: { is_main: true },
        attributes: {
          exclude: ["tags", "is_main", "createdAt", "updatedAt"],
        },
        order: [["end_date", "DESC"]],
        raw: true,
      });

      const data = [experience];
      return res
        .status(200)
        .json(
          jsonMessages(
            200,
            "yes",
            "Get series of experience details successfully",
            data
          )
        );
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(
          jsonMessages(
            500,
            "no",
            "Unable to get series of experience details",
            []
          )
        );
    }
  },

  getOneExperience: async (req, res) => {
    try {
      const { id } = req.params;
      const experience = await Experience.findByPk(id, {
        attributes: {
          exclude: ["tags", "is_main", "createdAt", "updatedAt"],
        },
      });

      if (!experience) {
        return res
          .status(400)
          .json(jsonMessages(400, "no", "Experience details not found", []));
      }

      const data = [experience.toJSON()];
      return res
        .status(200)
        .json(
          jsonMessages(200, "yes", "Get experience details successfully", data)
        );
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to get experience details", []));
    }
  },

  updateExperience: async (req, res) => {
    try {
      const { id } = req.params;
      const experience = await Experience.findByPk(id, {
        attributes: {
          exclude: ["tags", "is_main", "createdAt", "updatedAt"],
        },
      });

      if (!experience) {
        return res
          .status(400)
          .json(jsonMessages(400, "no", "Experience details not found", []));
      }

      experience.set(req.body);
      await experience
        .save()
        .then((updatedExperience) => {
          const data = [updatedExperience.toJSON()];
          return res
            .status(200)
            .json(
              jsonMessages(
                200,
                "yes",
                "Update experience details successfully",
                data
              )
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
                "Unable to update experience details successfully",
                []
              )
            );
        });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(
          jsonMessages(500, "no", "Unable to update experience details", [])
        );
    }
  },
};

module.exports = userController;
