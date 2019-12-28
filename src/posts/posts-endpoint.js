const path = require("path");
const express = require("express");
const postsService = require("./posts-service");
const { requireAuth } = require("../middleware/jwt-auth");
const postsRouter = express.Router();

const jsonParser = express.json();

postsRouter
  .route("/")
  .all(requireAuth)
  .get((req, res, next) => {
    const knex = req.app.get("db");
    postsService
      .getAllPosts(knex)
      .then(posts => {
        return res
          .status(200)
          .json(posts.map(posts => postsService.serializePost(posts)));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knex = req.app.get("db");
    const { user_id, title, type, priority, wp_id, content } = req.body;
    // create posts object that includes the wpId
    const posts = { user_id, title, type, priority, wp_id, content };
    // check if there is a posts in the req body
    if (!posts) {
      return res
        .status(400)
        .json({ error: { message: `Missing posts in request body` } });
    }
    // check for missing fields
    for (const [key, value] of Object.entries(posts)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    }
    //create post
    postsService.createPost(knex, posts).then(post => {
      return res
        .status(201)
        .location(path.posix.join(`/api/posts` + `/${post.post_id}`))
        .json(postsService.serializePost(post));
    });
  });

postsRouter
  .route("/:id")
  .all(requireAuth)
  .all((req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.id;
    postsService
      .getPostById(knex, id)
      .then(post => {
        if (!post) {
          return res.status(404).json({ error: { message: `Post not found` } });
        }
        res.post = post;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    return res.status(200).json(postsService.serializePost(res.post));
  })
  .delete((req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.id;
    postsService
      .deletePost(knex, id)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.id;
    const newPostInfo = req.body;
    if (!newPostInfo) {
      return res.status(400).json({
        error: {
          message: `Request body must contain a new field`
        }
      });
    }

    postsService
      .updatePost(knex, id, newPostInfo)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

postsRouter
  .route("/wp/:id")
  .all(requireAuth)
  .get((req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.id;
    const type = req.query.type || "all";

    postsService
      .getWpPosts(knex, id, type)
      .then(posts => {
        return res.json(posts.map(posts => postsService.serializePost(posts)));
      })
      .catch(next);
  });

module.exports = postsRouter;
