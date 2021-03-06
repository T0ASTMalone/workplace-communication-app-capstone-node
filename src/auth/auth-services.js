const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");

const AuthService = {
  getUserWithNickname(db, nickname) {
    return db("users")
      .innerJoin("workplaces", "users.wp_id", "workplaces.wp_id")
      .select("users.*", "workplaces.wp_name", "workplaces.wp_code")
      .where({ "users.nickname": nickname })
      .first();
  },

  getUsrByNickname(db, nickname) {
    return db("users")
      .select("*")
      .where({ nickname })
      .first();
  },

  parseBasicToken(token) {
    return Buffer.from(token, "base64")
      .toString()
      .split(":");
  },
  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  },
  createJwt(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      expiresIn: config.JWT_EXPIRY,
      algorithm: "HS256"
    });
  },
  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ["HS256"]
    });
  }
};

module.exports = AuthService;
