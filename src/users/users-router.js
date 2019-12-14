const path = require("path");
const express = require("express");
const usersService = require("./users-service");
const requireAuth = require("../auth/auth-router");
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
    const { username, password, code, nickname, img } = req.body;
    // find WorkPlace with code provided
    // create user object that includes the wpId and wpName
    const user = {
      username,
      password,
      nickname,
      img
    };
    // check if there is a user in the req body
    if (!user) {
      return res
        .status(400)
        .json({ error: { message: `Missing user in request body` } });
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
        // else get wpId and wpName if WorkPlace
        user.type = "pending";
        user.wp_id = wp.wp_id;
        user.wp_name = wp.wp_name;

        // check for missing fields
        for (const [key, value] of Object.entries(user)) {
          if (value == null) {
            if (key !== "nickname" && key !== "img") {
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
        // validate that users with that username does not already exists
        // in the WorkPlace
        usersService.usrExists(knex, username, user.wp_id).then(existing => {
          // if username already exists in WorkPlace
          // return user already exists
          if (existing) {
            return res
              .status(400)
              .json({ error: { message: "User already exists" } });
          }
          // hash the users password
          return usersService.hashPass(password).then(hashedPass => {
            user.password = hashedPass;
            // create user
            return usersService.createUser(knex, user).then(user => {
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
  .get((res, req, next) => {
    return res.status(200).json(usersService.serializeUser(res.user));
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
          message: `Request body must contain a 'user name'`
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
    usersService
      .getWpUsers(knex, id)
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

// wp specific users router for getting pending users

module.exports = usersRouter;
