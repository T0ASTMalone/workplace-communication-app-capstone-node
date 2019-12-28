const path = require("path");
const express = require("express");
const seenService = require("./seen-service");
const { requireAuth } = require("../middleware/jwt-auth");
const seenRouter = express.Router();

const jsonParser = express.json();

// ack is short for acknowledgement
// acknowledgement or acknowledgements seemed like to long of a variable nickname lol

seenRouter
  .route("/")
  .all(requireAuth)
  .get((req, res, next) => {
    const knex = req.app.get("db");
    seenService
      .getAllAcks(knex)
      .then(acks => {
        return res
          .status(200)
          .json(acks.map(ack => seenService.serializePost(ack)));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knex = req.app.get("db");
    const { user_id, post_id } = req.body;
    // create acknowledgement
    const ack = { user_id, post_id };
    console.log(ack);
    // check if there is a posts in the req body
    if (!ack) {
      return res.status(400).json({
        error: { message: `Missing acknowledgement in request body` }
      });
    }

    // check for missing fields
    for (const [key, value] of Object.entries(ack)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    }

    //check if post exists
    seenService.postExists(knex, ack.post_id).then(postExists => {
      console.log(postExists);
      if (!postExists) {
        console.log("ran post not found");
        return res.status(400).json({
          error: `Post does not or no longer exists`
        });
      }
      //create acknowledgement
      seenService.createAck(knex, ack).then(ack => {
        return res
          .status(201)
          .location(path.posix.join(`/api/seen` + `/${ack.id}`))
          .json(seenService.serializeAck(ack));
      });
    });
  });

seenRouter
  .route("/:id")
  .all(requireAuth)
  .all((req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.id;
    seenService
      .getAckById(knex, id)
      .then(ack => {
        if (!ack) {
          return res
            .status(404)
            .json({ error: { message: `Acknowledgement not found` } });
        }
        res.ack = ack;
        next();
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.id;
    ackService
      .deleteAck(knex, id)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  });

seenRouter
  .route("/post/:id")
  .all(requireAuth)
  .get((req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.id;

    seenService
      .getPostAcks(knex, id)
      .then(acks => {
        return res.json(acks.map(ack => postsService.serializeAck(ack)));
      })
      .catch(next);
  });

module.exports = seenRouter;
