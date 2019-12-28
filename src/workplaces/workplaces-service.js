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

  getById(db, wp_id) {
    return db("workplaces")
      .select("*")
      .where({ wp_id })
      .first();
  },

  serializeWp(wp, created) {
    if (created) {
      return {
        wp_id: wp.wp_id,
        wp_name: xss(wp.wp_name),
        type: wp.type,
        wp_code: wp.wp_code
      };
    }
    return {
      wp_id: wp.wp_id,
      wp_name: xss(wp.wp_name),
      type: wp.type
    };
  }
};

module.exports = wpService;
