const config = require("../config");
const { User } = require("../db/models");
const jsonMessages = require("../utils/jsonMessages");
const jwt = require("jsonwebtoken");

const authController = {
  genJwtToken: (id, type) => {
    if (type === "access") {
      exp = { expiresIn: config.secrets.jwtExp };
      secret = config.secrets.jwt;
    } else if (type === "refresh") {
      exp = { expiresIn: config.secrets.refreshExp };
      secret = config.secrets.refresh;
    }

    return jwt.sign({ id }, secret, exp);
  },

  verifyToken: (token, type) =>
    new Promise((resolve, reject) => {
      const secret =
        type === "access" ? config.secrets.jwt : config.secrets.refresh;

      jwt.verify(token, secret, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      });
    }),
  //signup create user and default resume for user
  signup_handler: async (req, res) => {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res
        .status(400)
        .json(
          jsonMessages(
            400,
            "no",
            "All fields required. Input field must not be empty",
            []
          )
        );
    }

    try {
      const user = await User.create(req.body);

      if (user) {
        //create default resume when user signup
        ResumeSetupData = {
          identifier: "Default Resume",
          has_phone: true,
          has_address: false,
          has_socialmedia: true,
          tags: ["default"],
          job_tabs: [],
          is_main: true,
        };

        resume = await user.createResume(ResumeSetupData).catch((err) => {
          return res
            .status(400)
            .json(
              jsonMessages(400, "no", "Failed creating default resume", [])
            );
        });

        const accessToken = authController.genJwtToken(user.id, "access");
        const refreshToken = authController.genJwtToken(user.id, "refresh");

        req.session.user = {
          id: user.id,
          accessToken,
          refreshToken,
        };

        return res.status(201).json(
          jsonMessages(201, "yes", "Account signup successfully", [
            {
              id: user.id,
              accessToken,
            },
          ])
        );
      }
    } catch (err) {
      const [ValidationErrorItem = {}] = err.errors || [];
      const { message = "" } = ValidationErrorItem;
      const msg =
        message === "Email must be unique"
          ? "Failed to register, invalid data!"
          : message;

      return res.status(500).json(jsonMessages(500, "no", msg, []));
    }
  },

  login_handler: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(
          jsonMessages(
            400,
            "no",
            "Email and password fields must not be empty",
            []
          )
        );
    }

    try {
      const user = await User.findOne({ where: { email } });

      if (user && (await user.authenticate(password))) {
        const accessToken = authController.genJwtToken(user.id, "access");
        const refreshToken = authController.genJwtToken(user.id, "refresh");

        req.session.user = {
          id: user.id,
          accessToken,
          refreshToken,
        };

        return res.status(201).json(
          jsonMessages(201, "yes", "Login successfully", [
            {
              id: user.id,
              accessToken,
            },
          ])
        );
      } else {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "Invalid email or password", []));
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(
          jsonMessages(500, "no", "Unable to log in due to internal error", [])
        );
    }
  },

  refreshToken_handler: async (req, res) => {
    const { refreshToken } = req.session.user || {};

    try {
      const decoded = await authController.verifyToken(refreshToken, "refresh");
      const user = await User.findByPk(decoded.id, {
        attributes: ["id", "email"],
      });

      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      const newAccessToken = authController.genJwtToken(user.id, "access");
      const newRefreshToken = authController.genJwtToken(user.id, "refresh");

      req.session.user.accessToken = newAccessToken;
      req.session.user.refreshToken = newRefreshToken;

      return res.status(201).json(
        jsonMessages(201, "yes", "", [
          {
            id: user.id,
            accessToken: newAccessToken,
          },
        ])
      );
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(jsonMessages(500, "no", "Unable to generate token", []));
    }
  },

  logout_handler: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json(jsonMessages(500, "no", "Logout operation error", []));
      } else {
        return res
          .status(200)
          .json(jsonMessages(200, "yes", "Logout successfully", []));
      }
    });
  },

  protect: async (req, res, next) => {
    const { authorization = "" } = req.headers;
    const { accessToken } = req.session.user || {};

    if (!authorization.startsWith("Bearer")) {
      return res
        .status(401)
        .json(jsonMessages(401, "no", "Not authorized. Missing token", []));
    }

    token = authorization.split(" ")[1].trim();

    if (token !== accessToken) {
      return res
        .status(401)
        .json(jsonMessages(401, "no", "AccessToken not valid", []));
    }

    try {
      const decoded = await authController.verifyToken(token, "access");
      const user = await User.findByPk(decoded.id, {
        attributes: ["id", "email"],
      });

      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "User not found", []));
      }

      req.user = user;
      next();
    } catch (err) {
      console.log(err);
      return res.status(401).json(jsonMessages(401, "no", err.message, []));
    }
  },
};

module.exports = authController;
