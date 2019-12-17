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

  getWpPost(db, wp_id) {
    return db("posts")
      .select("*")
      .where({ wp_id });
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
      post_id: post.post_id,
      title: xss(post.title),
      type: post.type,
      priority: post.priority,
      wp_id: post.wp_id,
      content: xss(post.content),
      user_img: post.user_img
    };
  }
};

module.exports = postsService;
