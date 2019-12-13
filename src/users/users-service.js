const xss = require("xss");

const userService = {
  getUsers(db) {
    return db("users").select("*");
  },

  usrExists(db, username, wp_id) {
    return db("users")
      .where({ username })
      .where({ wp_id })
      .first()
      .then(user => !!user);
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
