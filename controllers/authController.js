const config = require("../config");
const { User } = require("../db/models");
const jsonMessages = require("../utils/jsonMessages");
const jwt = require("jsonwebtoken");

const authController = {
  genJwtToken: (id, type) => {
    if (type === "access") {
      exp = { expiresIn: config.secrets.jwtExp };
    } else if (type === "refresh") {
      exp = { expiresIn: config.secrets.refreshExp };
    }

    return jwt.sign({ id }, config.secrets.jwt, exp);
  },

  verifyToken: (token) =>
    new Promise((resolve, reject) => {
      jwt.verify(token, config.secrets.jwt, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      });
    }),

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
        const accessToken = authController.genJwtToken(user.id, "access");
        const refreshToken = authController.genJwtToken(user.id, "refresh");

        return res.status(201).json(
          jsonMessages(201, "yes", "", [
            {
              id: user.id,
              accessToken,
              refreshToken,
            },
          ])
        );
      }
    } catch (err) {
      const [ValidationErrorItem = {}] = err.errors || [];
      const { message = "" } = ValidationErrorItem;
      const msg =
        message === "email must be unique"
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
            "email and password fields must not be empty",
            []
          )
        );
    }

    try {
      const user = await User.findOne({ where: { email } });
      if (user && (await user.authenticate(password))) {
        const accessToken = authController.genJwtToken(user.id, "access");
        const refreshToken = authController.genJwtToken(user.id, "refresh");

        return res.status(201).json(
          jsonMessages(201, "yes", "", [
            {
              id: user.id,
              accessToken,
              refreshToken,
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
      res
        .status(500)
        .json(
          jsonMessages(500, "no", "unable to log in due to internal error", [])
        );
    }
  },

  protect: async (req, res, next) => {
    const { authorization = "" } = req.headers;

    if (!authorization.startsWith("Bearer")) {
      return res
        .status(401)
        .json(jsonMessages(401, "no", "Not authorized. Missing token", []));
    }

    token = authorization.split(" ")[1].trim();

    try {
      const decoded = await authController.verifyToken(token);
      const user = await User.findByPk(decoded.id, {
        attributes: ["id", "email"],
      });

      if (!user) {
        return res
          .status(401)
          .json(jsonMessages(401, "no", "user not found", []));
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json(jsonMessages(401, "no", err.message, []));
    }
  },
};

module.exports = authController;
