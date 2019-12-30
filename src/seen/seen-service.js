const xss = require("xss");

const postsService = {
  getAllAcks(db) {
    return db("seen")
      .innerJoin("users", "seen.user_id", "users.user_id")
      .select("seen.*", "users.nickname");
  },

  postExists(db, post_id) {
    return db("posts")
      .where({ post_id })
      .first()
      .then(post => !!post);
  },

  createAck(db, ack) {
    return db("seen")
      .insert(ack)
      .returning("*")
      .then(rows => rows[0]);
  },

  getAckById(db, id) {
    return db("seen")
      .innerJoin("users", "seen.user_id", "users.user_id")
      .select("seen.*", "users.nickname")
      .where({ "seen.id": id })
      .first();
  },

  deleteAck(db, id) {
    return db("seen")
      .where({ id })
      .delete();
  },

  getPostAcks(db, post_id) {
    return db("seen")
      .innerJoin("users", "seen.user_id", "users.user_id")
      .select("seen.*", "users.nickname")
      .where({ "seen.post_id": post_id });
  },

  userAlreadyLiked(db, ack) {
    const { post_id, user_id } = ack;
    return db("seen")
      .select("*")
      .where({ post_id })
      .where({ user_id })
      .first();
  },

  serializeAck(ack) {
    return {
      id: ack.id,
      user_id: ack.user_id,
      nickname: xss(ack.nickname),
      post_id: ack.post_id
    };
  }
};

module.exports = postsService;
