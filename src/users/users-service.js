const xss = require("xss");

const userService = {
  getUsers(db) {
    return db("users").select("*");
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
