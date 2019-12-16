const path = require("path");
const express = require("express");
const postsService = require("./posts-service");
const { requireAuth } = require("../middleware/jwt-auth");
const postsRouter = express.Router();

const jsonParser = express.json();

postsRouter
  .route("/")
  .get((req, res, next) => {
    const knex = req.app.get("db");
    postsService
      .getAllPosts(knex)
      .then(posts => {
        res.json(posts.map(posts => postsService.serializePosts(posts)));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knex = req.app.get("db");
    const { user_id, title, type, priority, wp_id, user_img } = req.body;
    // find WorkPlace with code provided
    // create posts object that includes the wpId and wpName
    const posts = { user_id, title, type, priority, wp_id, user_img };
    // check if there is a posts in the req body
    if (!posts) {
      return res
        .status(400)
        .json({ error: { message: `Missing posts in request body` } });
    }

    // check for missing fields
    for (const [key, value] of Object.entries(posts)) {
      if (value == null) {
        if (key !== "nickname" && key !== "img") {
          return res.status(400).json({
            error: `Missing '${key}' in request body`
          });
        }
      }
    }
    //create post
    postsService.createPost(knex, post).then(post => {
      return res
        .status(201)
        .location(path.posix.join(`/api/posts` + `/${post.post_id}`))
        .json(postsService.serializePosts(post));
    });
  });

module.exports = postsRouter;
