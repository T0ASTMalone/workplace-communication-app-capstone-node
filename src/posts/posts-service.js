const xss = require("xss");

const postsService = {
  getAllPosts(db) {
    return db("posts").select("*");
  },

  createPost(db, post) {
    return db("posts")
      .insert(post)
      .returning("*")
      .then(rows => rows[0]);
  },

  // select * from posts as p inner join users as usr on p.user_id = em.user_id

  getWpPosts(db, wp_id, type) {
    console.log(wp_id, type);
    if (type === "all") {
      return db("posts")
        .innerJoin("users", "posts.user_id", "users.user_id")
        .select(
          "posts.post_id",
          "users.nickname",
          "posts.user_id",
          "posts.title",
          "posts.content",
          "users.img",
          "posts.type",
          "posts.priority",
          "posts.date_added",
          "posts.wp_id"
        )
        .where({ "posts.wp_id": wp_id });
    }
    return db("posts")
      .innerJoin("users", "posts.user_id", "users.user_id")
      .select(
        "posts.post_id",
        "users.nickname",
        "posts.user_id",
        "posts.title",
        "posts.content",
        "users.img",
        "posts.type",
        "posts.priority",
        "posts.date_added",
        "posts.wp_id"
      )
      .where({ "posts.wp_id": wp_id })
      .where({ "posts.type": type });
  },

  getPostById(db, post_id) {
    return db("posts")
      .select("*")
      .where({ post_id })
      .first();
  },

  deletePost(db, post_id) {
    return db("posts")
      .where({ post_id })
      .delete();
  },

  updatePost(db, post_id, newPost) {
    return db("posts")
      .where({ post_id })
      .update(newPost);
  },

  serializePost(post) {
    return {
      user_id: post.user_id,
      nickname: xss(post.nickname),
      post_id: post.post_id,
      title: xss(post.title),
      type: post.type,
      priority: post.priority,
      wp_id: post.wp_id,
      content: xss(post.content),
      img: post.img
    };
  }
};

module.exports = postsService;
