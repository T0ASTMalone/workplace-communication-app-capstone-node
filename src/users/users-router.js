const path = require("path");
const express = require("express");
const usersService = require("./users-service");
const { requireAuth } = require("../middleware/jwt-auth");
const usersRouter = express.Router();

const jsonParser = express.json();

usersRouter
  .route("/")
  .get((req, res, next) => {
    const knex = req.app.get("db");
    usersService
      .getAllUsers(knex)
      .then(users => {
        res.json(users.map(user => usersService.serializeUser(user)));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knex = req.app.get("db");

    const { username, password, code, type, nickname, img } = req.body;
    // find WorkPlace with code provided
    // create user object that includes the wpId and wpName

    const user = {
      username,
      type,
      password,
      code,
      nickname,
      img
    };
    // check if there is a user in the req body
    if (!user) {
      return res
        .status(400)
        .json({ error: { message: `Missing user in request body` } });
    }

    // check for missing fields
    for (const [key, value] of Object.entries(user)) {
      if (value == null) {
        if (key !== "img") {
          return res.status(400).json({
            error: `Missing '${key}' in request body`
          });
        }
      }
    }

    // validate password
    const passErr = usersService.validatePassword(password);

    if (passErr) {
      return res.status(400).json({ error: { message: passErr } });
    }

    usersService
      .getWp(knex, code)
      .then(wp => {
        // if WorkPlace with provided code does not exists
        // return wp not found
        if (!wp) {
          return res
            .status(404)
            .json({ error: { message: `Invalid WorkPlace Code` } });
        }
        console.log(type);
        // else get wpId and wpName if WorkPlace
        if (type !== "creator") {
          user.type = "pending";
        }
        user.wp_id = wp.wp_id;

        delete user.code;

        // validate that users with that username does not already exists
        // in the WorkPlace
        usersService.usrExists(knex, username, user.wp_id).then(existing => {
          // if username already exists in WorkPlace
          // return user already exists
          if (existing) {
            return res
              .status(400)
              .json({ error: { message: "Username already taken" } });
          }
          // hash the users password
          return usersService.hashPass(password).then(hashedPass => {
            user.password = hashedPass;
            // create user
            return usersService.createUsr(knex, user).then(user => {
              console.log(user);
              // respond with new user
              res
                .status(201)
                .location(path.posix.join(req.originalUrl + `/${user.user_id}`))
                .json(usersService.serializeUser(user));
            });
          });
        });
      })
      .catch(next);
  });

usersRouter
  .route("/:id")
  .all(requireAuth)
  .all((req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.id;
    usersService
      .getUsrById(knex, id)
      .then(user => {
        if (!user) {
          return res.status(404).json({ error: { message: `User not found` } });
        }
        res.user = user;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    return res.json(usersService.serializeUser(res.user));
  })
  .delete((req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.id;
    usersService
      .deleteUsr(knex, id)
      .then(() => {
        return res.status(201).end();
      })
      .catch(next);
  })
  .patch((req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.id;
    const newUserInfo = req.body;
    if (!newUserInfo) {
      return res.status(400).json({
        error: {
          message: `Request body must contain new info`
        }
      });
    }
    usersServices
      .updateUser(knex, id, newUserInfo)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

// wp specific users router
// use requireAuth
usersRouter
  .route("/wp/:wpId")
  .all(requireAuth)
  .get((req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.wpId;
    // accepts query string for user type
    // creator, user, or pending
    const type = req.query.type || "all";

    usersService
      .getWpUsers(knex, id, type)
      .then(users => {
        if (!users) {
          return res.status(404).json({
            error: { message: `There are no users in this WorkPlace` }
          });
        }
        return res
          .status(200)
          .json(users.map(user => usersService.serializeUser(user)));
      })
      .catch(next);
  });

module.exports = usersRouter;
