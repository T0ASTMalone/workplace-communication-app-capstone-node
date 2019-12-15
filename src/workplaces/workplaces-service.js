const xss = require("xss");

const wpService = {
  getWorkplaces(db) {
    return db("workplaces").select("*");
  },

  createWp(db, wp) {
    return db("workplaces")
      .insert(wp)
      .returning("*")
      .then(rows => rows[0]);
  },

  serializeWp(wp) {
    return {
      id: wp.wp_id,
      name: xss(wp.wp_name),
      type: wp.type
    };
  }
};

module.exports = wpService;
