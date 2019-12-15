const xss = require("xss");
const bcrypt = require("bcryptjs");

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const userService = {
  getAllUsers(db) {
    return db("users").select("*");
  },

  getWpUsers(db, wp_id, type) {
    if (type !== "all") {
      return db("users")
        .select("*")
        .where({ wp_id })
        .where({ type });
    }
    return db("users")
      .select("*")
      .where({ wp_id });
  },

  getUsrById(db, id) {
    return db("users")
      .select("*")
      .where("user_id", id)
      .first();
  },

  usrExists(db, username, wp_id) {
    return db("users")
      .where({ username })
      .where({ wp_id })
      .first()
      .then(user => !!user);
  },

  getWp(db, wp_code) {
    return db("workplaces")
      .select("*")
      .where({ wp_code })
      .first();
  },

  createUsr(db, user) {
    return db("users")
      .insert(user)
      .returning("*")
      .then(rows => rows[0]);
  },

  deleteUsr(db, id) {
    return db("users")
      .where("user_id", id)
      .delete();
  },

  updateUser(knex, id, newUser) {
    return knex("users")
      .where("user_id", id)
      .update(newUser);
  },

  validatePassword(password) {
    if (password.length < 8) {
      return "Password be longer than 8 characters";
    }
    if (password.length > 72) {
      return "Password be less than 72 characters";
    }
    if (password.startsWith(" ") || password.endsWith(" ")) {
      return "Password must not start or end with empty spaces";
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return "Password must contain 1 upper case, lower case, number and special character";
    }
    return null;
  },

  hashPass(password) {
    return bcrypt.hash(password, 12);
  },

  serializeUser(user) {
    return {
      user_id: user.user_id,
      username: xss(user.username),
      wp_id: user.wp_id,
      wp_name: xss(user.wp_name),
      type: user.type,
      nickname: xss(user.nickname),
      img: user.img
    };
  }
};
module.exports = userService;
