const xss = require("xss");

const postsPerReq = 10;

const postsService = {
  getAllPosts(db) {
    const colId = db.ref("posts.post_id");

    return db("posts")
      .innerJoin("users", "posts.user_id", "users.user_id")
      .select(
        "posts.*",
        "users.nickname",
        "users.img",
        "users.username",
        db("seen")
          .count("*")
          .where({ post_id: colId })
          .as("total")
      )
      .groupBy(
        "posts.post_id",
        "users.nickname",
        "users.img",
        "users.username",
        "total"
      )
      .orderBy("posts.date_added", "desc");
  },

  createPost(db, post) {
    return db("posts")
      .insert(post)
      .returning("*")
      .then(rows => this.getPostById(db, rows[0].post_id));
  },

  getWpPosts(db, wp_id, type, page) {
    // need to query seen table for count of likes
    const colId = db.ref("posts.post_id");
    const offset = postsPerReq * (page - 1);
    if (type === "all") {
      return db("posts")
        .innerJoin("users", "posts.user_id", "users.user_id")
        .select(
          "posts.*",
          "users.nickname",
          "users.img",
          "users.username",
          db("seen")
            .count("*")
            .where({ post_id: colId })
            .as("total")
        )
        .where({ "posts.wp_id": wp_id })
        .groupBy(
          "posts.post_id",
          "users.nickname",
          "users.img",
          "users.username",
          "total"
        )
        .orderBy("posts.date_added", "desc");
    }
    return db("posts")
      .innerJoin("users", "posts.user_id", "users.user_id")
      .select(
        "posts.*",
        "users.nickname",
        "users.img",
        "users.username",
        db("seen")
          .count("*")
          .where({ post_id: colId })
          .as("total")
      )
      .where({ "posts.wp_id": wp_id })
      .where({ "posts.type": type })
      .groupBy("posts.post_id", "users.nickname", "users.img", "users.username")
      .orderBy("posts.date_added", "desc")
      .limit(postsPerReq)
      .offset(offset);
  },

  getUserPosts(db, user_id, type, page) {
    // need to query seen table for count of likes
    const colId = db.ref("posts.post_id");
    const offset = postsPerReq * (page - 1);
    if (type === "all") {
      return db("posts")
        .innerJoin("users", "posts.user_id", "users.user_id")
        .select(
          "posts.*",
          "users.nickname",
          "users.img",
          "users.username",
          db("seen")
            .count("*")
            .where({ post_id: colId })
            .as("total")
        )
        .where({ "posts.wp_id": user_id })
        .groupBy(
          "posts.post_id",
          "users.nickname",
          "users.img",
          "users.username",
          "total"
        )
        .orderBy("posts.date_added", "desc")
        .limit(postsPerReq)
        .offset(offset);
    }
    return db("posts")
      .innerJoin("users", "posts.user_id", "users.user_id")
      .select(
        "posts.*",
        "users.nickname",
        "users.img",
        "users.username",
        db("seen")
          .count("*")
          .where({ post_id: colId })
          .as("total")
      )
      .where({ "posts.user_id": user_id })
      .where({ "posts.type": type })
      .groupBy("posts.post_id", "users.nickname", "users.img", "users.username")
      .orderBy("posts.date_added", "desc")
      .limit(postsPerReq)
      .offset(offset);
  },

  getPostById(db, post_id) {
    return db
      .from("posts")
      .innerJoin("users", "posts.user_id", "users.user_id")
      .select(
        "posts.*",
        "users.nickname",
        "users.img",
        "users.username",
        db("seen")
          .count("*")
          .where({ "seen.post_id": post_id })
          .as("total")
      )
      .where({ "posts.post_id": post_id })
      .groupBy(
        "posts.post_id",
        "users.nickname",
        "users.img",
        "users.username",
        "total"
      )
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
      username: xss(post.username),
      nickname: xss(post.nickname),
      post_id: post.post_id,
      title: xss(post.title),
      type: post.type,
      priority: post.priority,
      wp_id: post.wp_id,
      date_added: post.date_added,
      content: xss(post.content),
      img: post.img,
      total: post.total || "0"
    };
  }
};

module.exports = postsService;
